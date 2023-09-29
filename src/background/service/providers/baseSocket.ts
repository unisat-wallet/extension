import mitt, { Handler, Emitter as MittEmitter } from './mitt';
import { BaseProvider } from './baseProvider';
import { isWs } from './utils';

export enum SocketConnection {
  READY = 'ready',
  CONNECT = 'connect',
  ERROR = 'error',
  CLOSE = 'close',
}

export enum SocketState {
  SOCKET_MESSAGE = 'socket_message',
  SOCKET_READY = 'socket_ready',
  SOCKET_CLOSE = 'socket_close',
  SOCKET_ERROR = 'socket_error',
  SOCKET_CONNECT = 'socket_connect',
  SOCKET_NETWORK_CHANGED = 'socket_networkChanged',
  SOCKET_ACCOUNTS_CHANGED = 'socket_accountsChanged',
}

export enum EmittType {
  INSTANCE = 'instance',
  PUBSUB = 'pubsub',
}

class BaseSocket extends BaseProvider {
  url: string;
  emitter: MittEmitter<any>;
  handlers: any = new Map();
  constructor(url: string) {
    super(url);
    if (!isWs(url)) {
      throw new Error(`${url} is not websocket`);
    }
    this.url = url;

    this.emitter = mitt(this.handlers);
  }
  resetHandlers() {
    // tslint:disable-next-line: forin
    for (const i in this.handlers) {
      delete this.handlers[i];
    }
  }

  once(type: string, handler: Handler) {
    this.emitter.on(type, handler);
    this.removeEventListener(type);
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
  reset() {
    this.removeEventListener('*');
    // this.registerEventListeners();
  }
  removeAllSocketListeners() {
    this.removeEventListener(SocketState.SOCKET_MESSAGE);
    this.removeEventListener(SocketState.SOCKET_READY);
    this.removeEventListener(SocketState.SOCKET_CLOSE);
    this.removeEventListener(SocketState.SOCKET_ERROR);
    this.removeEventListener(SocketState.SOCKET_CONNECT);
  }

  onReady(event: any) {
    this.emitter.emit(SocketConnection.READY, event);
    this.emitter.emit(SocketState.SOCKET_READY, event);
  }
  onError(error: any) {
    this.emitter.emit(SocketConnection.ERROR, error);
    this.emitter.emit(SocketState.SOCKET_ERROR, error);
    this.removeAllSocketListeners();
    this.removeEventListener('*');
  }
  onClose(error = null) {
    this.emitter.emit(SocketConnection.CLOSE, error);
    this.emitter.emit(SocketState.SOCKET_CLOSE, error);
    this.removeAllSocketListeners();
    this.removeEventListener('*');
  }
}

export { BaseSocket };
