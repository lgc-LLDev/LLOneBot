import 'event-target-polyfill';

class CustomEvent<T = any> extends Event {
  public readonly detail: T;

  constructor(type: string, eventInitDict?: CustomEventInit<T>) {
    super(type, eventInitDict);
    this.detail = eventInitDict?.detail ? eventInitDict.detail : ({} as any);
  }

  // eslint-disable-next-line class-methods-use-this
  public initCustomEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    detail?: T
  ) {
    return new CustomEvent(type, { bubbles, cancelable, detail });
  }
}

globalThis.CustomEvent = CustomEvent;
