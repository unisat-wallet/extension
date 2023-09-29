import mitt, { Handler, Emitter as MittEmitter } from './mitt';

class Emitter {
  handlers?: any = {};
  emitter: MittEmitter<any>;
  off: (type: string, handler: Handler) => void;
  emit: (type: string, event?: any) => void;
  promise: Promise<{}>;
  resolve?: any;
  reject?: any;
  then?: any;
  constructor() {
    this.emitter = mitt(this.handlers);
    this.off = this.emitter.off.bind(this);
    this.emit = this.emitter.emit.bind(this);
    // tslint:disable-next-line: no-empty
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.then = this.promise.then.bind(this.promise);
  }

  resetHandlers() {
    // tslint:disable-next-line: forin
    for (const i in this.handlers) {
      delete this.handlers[i];
    }
  }
  on(type: string, handler: Handler) {
    this.emitter.on(type, handler);
    return this;
  }
  once(type: string, handler: Handler) {
    this.emitter.on(type, (e: any) => {
      handler(e);
      this.removeEventListener(type);
    });
  }

  addEventListener(type: string, handler: Handler) {
    this.emitter.on(type, handler);
  }

  removeEventListener(type?: string, handler?: Handler) {
    if (!type) {
      this.handlers = {};
      return;
    }
    if (!handler) {
      delete this.handlers[type];
    } else {
      return this.emitter.off(type, handler);
    }
  }
  onError(error: any) {
    this.emitter.on('error', error);
    this.removeEventListener('*');
  }
  onData(data: any) {
    this.emitter.on('data', data);
    this.removeEventListener('*');
  }
  listenerCount(listenKey: any) {
    let count = 0;
    Object.keys(this.handlers).forEach((val) => {
      if (listenKey === val) {
        count += 1;
      }
    });
    return count;
  }
}

export { Emitter };
