import { camelCase, snakeCase } from 'cosmokit';

import { ConnectionConfig, manager } from './config';
import { formatError, logErr, objectKeyTransform, sleep } from './utils';

export interface IEventListener<TE extends Event = Event> {
  (evt: TE): void;
}

export interface IEventListenerObject<TE extends Event = Event> {
  handleEvent(object: TE): void;
}

export type TEvListenerFuncOrObj<TE extends Event = Event> =
  | IEventListener<TE>
  | IEventListenerObject<TE>;

export class CustomEventTarget<
  E extends { [key: string]: Event }
> extends EventTarget {
  public override addEventListener<K extends keyof E>(
    type: K,
    callback: TEvListenerFuncOrObj<E[K]> | null,
    options?: AddEventListenerOptions | boolean
  ): void {
    super.addEventListener(type as string, callback as any, options);
  }

  public override removeEventListener<K extends keyof E>(
    type: K,
    callback: TEvListenerFuncOrObj<E[K]> | null,
    options?: EventListenerOptions | boolean
  ): void {
    super.removeEventListener(type as string, callback as any, options);
  }
}

export type ConnectionReceiveEvent = CustomEvent<{}>;
export type ConnectionEventTypeMap = { receive: ConnectionReceiveEvent };

export class ConnectionEventTarget extends CustomEventTarget<ConnectionEventTypeMap> {
  constructor(public readonly endpoint: string) {
    super();
  }

  protected postEvent(msg: string) {
    let data;
    try {
      data = objectKeyTransform(JSON.parse(msg), camelCase);
    } catch (e) {
      logger.error(
        `Error parsing message from ${this.endpoint}: ${formatError(e)}`
      );
    }
    this.dispatchEvent(new CustomEvent('receive', { detail: data }));
    logger.info(`Received from ${this.endpoint}: ${JSON.stringify(data)}`); // TODO: test, remove
  }
}

export interface Connection extends CustomEventTarget<ConnectionEventTypeMap> {
  readonly connected: boolean;
  enable(): Promise<any>;
  disable(): Promise<any>;
  callApi(action: string, params: any): Promise<any>;
}

export interface ApiResponseOK {
  status: 'ok' | 'async';
  retcode: 0 | 1;
  data?: any;
  echo: any;
}
export interface ApiResponseError {
  status: 'error';
  retcode: number;
  msg: string;
  wording: string;
  echo: any;
}
export type ApiResponse = ApiResponseOK | ApiResponseError;
export class ActionFailedError extends Error {
  constructor(public readonly resp: ApiResponseError) {
    super(
      `Error when calling API: ` +
        `code=${resp.retcode} msg=${resp.msg} wording=${resp.wording}`
    );
  }
}
export function isApiResp(data: any): data is ApiResponse {
  return (
    typeof data === 'object' &&
    typeof data.status === 'string' &&
    typeof data.retcode === 'number'
  );
}

export class EchoManager {
  public readonly identifier = `${Math.random()}`.slice(2);

  public lastEchoId = 0;

  public get() {
    this.lastEchoId += 1;
    return `${this.identifier}:${this.lastEchoId}`;
  }
}

export class ForwardWSConnection
  extends ConnectionEventTarget
  implements Connection
{
  protected ws?: WSClient;

  public enabled = false;

  protected _connected = false;

  protected echoManager = new EchoManager();

  get connected() {
    return this._connected;
  }

  constructor(
    public readonly endpoint: string,
    protected accessToken?: string
  ) {
    super(endpoint);
  }

  protected connect(): Promise<void> {
    return Promise.race([
      new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Client not initialized'));
          return;
        }
        const endpoint = this.accessToken
          ? `${this.endpoint}?access_token=${this.accessToken}`
          : this.endpoint;
        const pSucc = this.ws.connectAsync(endpoint, (success) => {
          if (success) resolve();
          else reject(new Error(`Failed to connect: ${this.ws?.errorCode()}`));
        });
        if (!pSucc) reject(new Error('Failed to prepare connect'));
      }),
      new Promise<void>((_, reject) => {
        setTimeout(
          () => reject(new Error('Timeout')),
          manager.config.apiTimeout
        );
      }),
    ]);
  }

  protected async daemon() {
    /* eslint-disable no-await-in-loop */
    while (this.enabled) {
      this.ws = new WSClient();
      try {
        await this.connect();
        await this.setup();
      } catch (e) {
        await this.disable();
        if (!this.enabled) return;
        logger.error(
          `Cannot connect to ${this.endpoint}, ` +
            `reconnect in ${manager.config.reconnectInterval}ms: \n` +
            `${formatError(e)}`
        );
        await sleep(manager.config.reconnectInterval);
        continue;
      }

      this._connected = true;
      logger.info(`Connected to ${this.endpoint}`);
      this.callApi('get_login_info', {}) // TODO: test, remove
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        .then((resp) => {
          logger.info(JSON.stringify(resp));
        })
        .catch(logErr);
      let code;
      try {
        code = await this.waitUntilDisconnect();
      } catch (e) {
        logger.error(
          `Error when waiting disconnect for ${this.endpoint}, ` +
            `reconnect in ${manager.config.reconnectInterval}ms: \n` +
            `${formatError(e)}`
        );
      }
      this._connected = false;
      if (!this.enabled) {
        logger.warn(`Dropped connection to ${this.endpoint}`);
        return;
      }
      if (typeof code === 'number') {
        logger.error(
          `Lost connection to ${this.endpoint}, ` +
            `reconnect in ${manager.config.reconnectInterval}ms: code ${code}`
        );
      }
      await sleep(manager.config.reconnectInterval);
    }
    /* eslint-enable no-await-in-loop */
  }

  public async enable() {
    this.enabled = true;
    this.daemon().catch(logErr);
  }

  public async disable() {
    this.enabled = false;
    const { ws } = this;
    this.ws = undefined;
    ws?.shutdown();
    ws?.close();
  }

  protected async setup() {
    if (!this.ws) throw new Error('Client not initialized');
    this.ws.listen('onTextReceived', (msg) => {
      this.postEvent(msg);
    });
    this.ws.listen('onBinaryReceived', () => {
      logger.warn(`Unexpected binary data received from ${this.endpoint}`);
    });
    this.ws.listen('onError', (msg) => {
      logger.error(`Error from ${this.endpoint}: ${msg}`);
    });
  }

  protected async waitUntilDisconnect() {
    return Promise.race([
      new Promise<number>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Client not initialized'));
          return;
        }
        this.ws.listen('onLostConnection', (code) => resolve(code));
      }),
      (async () => {
        for (;;) {
          if (!this.enabled) return;
          // eslint-disable-next-line no-await-in-loop
          await sleep(1);
        }
      })(),
    ]);
  }

  public callApi(action: string, params: Record<string, any>): Promise<any> {
    if (!this.ws) throw new Error('Client not initialized');
    const echo = this.echoManager.get();
    let handler: (data: any) => any;
    const promiseCall = new Promise((resolve, reject) => {
      const body = JSON.stringify({
        action: snakeCase(action),
        params: objectKeyTransform(params, snakeCase),
        echo,
      });
      this.ws?.send(body);
      logger.info(`Sent to ${this.endpoint}: ${body}`); // TODO: test, remove
      handler = (ev: CustomEvent<ApiResponse>) => {
        const { detail } = ev;
        if (!isApiResp(detail) || detail.echo !== echo) return;
        if (detail.status === 'error') {
          reject(new ActionFailedError(detail));
        } else {
          this.removeEventListener('receive', handler);
          resolve(detail.data);
        }
      };
      this.addEventListener('receive', handler);
    });
    const promiseTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        this.removeEventListener('receive', handler);
        reject(new Error('Timeout'));
      }, manager.config.apiTimeout);
    });
    return Promise.race([promiseCall, promiseTimeout]);
  }
}

export const connections: Connection[] = [];

export function createConnection(connConf: ConnectionConfig): Connection {
  const { type } = connConf;
  switch (type) {
    case 'ws':
      return new ForwardWSConnection(connConf.endpoint, connConf.accessToken);
    default:
      throw new Error(`Unsupported connection type: ${type}`);
  }
}

export function resetConnections() {
  const cachedConns = connections.slice();
  connections.length = 0;
  for (const conn of cachedConns) conn.disable().catch(logErr);
  connections.push(...manager.config.connections.map(createConnection));
  connections.forEach((conn) => conn.enable().catch(logErr));
}
