import Schema from 'schemastery';

import { CONFIG_PATH, PLUGIN_NAME } from './const';
import { formatError } from './utils';

export class ConfigManager<S, T> {
  public readonly path: string;

  public readonly filePath: string;

  public config: T;

  constructor(
    public readonly schema: Schema<S, T>,
    public readonly dirname: string,
    public readonly filename: string = 'config.json'
  ) {
    this.path = `${CONFIG_PATH}/${dirname}`;
    this.filePath = `${this.path}/${filename}`;
    this.config = this.load();
  }

  public load(): T {
    if (!file.exists(this.filePath)) {
      const data = this.schema();
      file.writeTo(this.filePath, JSON.stringify(data));
      return data;
    }

    const str = file.readFrom(this.filePath);
    if (!str) throw new Error(`Failed to read ${this.filePath}`);
    let data;
    try {
      data = JSON.parse(str);
    } catch (e) {
      throw new Error(`Error parsing ${this.filePath}: ${formatError(e)}`);
    }
    return this.schema(data);
  }

  public reload() {
    this.config = this.load();
  }

  public save(data?: S) {
    if (!data) data = this.config as any as S;
    let validated;
    let str;
    try {
      validated = this.schema(data);
      str = JSON.stringify(validated);
    } catch (e) {
      throw new Error(
        `Error stringify data will save to ${this.filePath}: ` +
          `${formatError(e)}`
      );
    }
    this.config = validated;
    file.writeTo(this.filePath, str);
  }
}

export interface UniversalConnectionConfig {
  accessToken?: string;
}
export interface ForwardWsConnectionConfig extends UniversalConnectionConfig {
  type: 'ws';
  endpoint: string;
}
export type ConnectionConfig = ForwardWsConnectionConfig;

export interface Config {
  apiTimeout: number;
  reconnectInterval: number;
  connections: ConnectionConfig[];
}

export const universalConnectionSchema = Schema.object({
  accessToken: Schema.string().required(false),
});
export const forwardWsConnectionSchema = Schema.intersect([
  universalConnectionSchema,
  Schema.object({
    type: Schema.const('ws').required(),
    endpoint: Schema.string().required(),
  }),
]);
export const connectionSchema = Schema.union([forwardWsConnectionSchema]);

export const schema: Schema<Config> = Schema.object({
  apiTimeout: Schema.number().default(30000),
  reconnectInterval: Schema.number().default(3000),
  connections: Schema.array(connectionSchema).default([]),
});
export const manager = new ConfigManager(schema, PLUGIN_NAME);
