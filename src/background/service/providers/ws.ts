import {
  BaseSocket,
  SocketConnection,
  SocketState
  // EmittType,
} from './baseSocket';
import { isWs, isObject, isArray } from './utils';
import { JsonRpc } from './rpcMethod/builder';
import { composeMiddleware } from './rpcMethod/net';
import { RPCRequestPayload } from './types';
import { Handler } from './mitt';

class WSProvider extends BaseSocket {
  get connected() {
    return this.connection.readyState === this.connection.OPEN;
  }

  url: string;
  subscriptions: any;
  options: any;
  connection: WebSocket;
  jsonRpc: JsonRpc;

  // ws: w3cwebsocket;
  constructor(url: string, options: any = {}) {
    super(url);
    if (!isWs(url)) {
      throw new Error(`${url} is not websocket`);
    }
    this.url = url;
    this.options = options;
    this.connection = this.createWebsocketProvider(this.url, this.options);
    this.jsonRpc = new JsonRpc();
    this.subscriptions = {};
    this.registerEventListeners();
    // this.on = this.emitter.on.bind(this);
  }

  on(type: string, handler: Handler) {
    this.emitter.on(type, handler);
    return this;
  }
  onData(handler: any) {
    this.emitter.on('data', handler);
    return this;
  }
  onError(event: any) {
    if (event.code === 'ECONNREFUSED') {
      this.reconnect();
      return;
    }
    super.onError(event);
  }
  onClose(closeEvent: any) {
    if (closeEvent.code !== 1000 || closeEvent.wasClean === false) {
      this.reconnect();
      return;
    }
    super.onClose();
  }

  createWebsocketProvider(url: string, options: any = {}) {
    // tslint:disable-next-line: no-string-literal
    return new self.WebSocket(url, options.protocol);
  }

  reconnect() {
    setTimeout(() => {
      this.removeAllSocketListeners();
      this.connection = this.createWebsocketProvider(this.url, this.options);
      this.registerEventListeners();
    }, 5000);
  }
  isConnecting() {
    return this.connection.readyState === this.connection.CONNECTING;
  }

  send(payload: RPCRequestPayload<object>): Promise<any> {
    const [tReq, tRes] = this.getMiddleware(payload.method);
    const reqMiddleware = composeMiddleware(...tReq);
    const resMiddleware = composeMiddleware(...tRes);

    return new Promise((resolve, reject) => {
      // TODO: test on Error

      if (this.connected) {
        try {
          this.connection.send(reqMiddleware(JSON.stringify(payload)));
        } catch (error) {
          // TODO !isConnecting then reconnect?
          this.removeEventListener(SocketConnection.ERROR);
          throw error;
        }
      }
      this.emitter.on(SocketConnection.CONNECT, () => {
        try {
          this.connection.send(reqMiddleware(JSON.stringify(payload)));
        } catch (error) {
          // TODO !isConnecting then reconnect?
          this.removeEventListener(SocketConnection.ERROR);
          throw error;
        }
      });
      this.emitter.on(`${payload.id}`, (data: any) => {
        resolve(resMiddleware(data));
        this.removeEventListener(`${payload.id}`);
      });
      this.emitter.on(SocketConnection.ERROR, reject);
    });
  }

  async subscribe(payload: RPCRequestPayload<any[]>) {
    const response = await this.send(payload);
    const responseValidateResult = this.validate(response);
    if (responseValidateResult instanceof Error) {
      throw responseValidateResult;
    }
    this.subscriptions[response.result] = {
      id: response.result,
      subscribeMethod: payload.method,
      parameters: payload.params,
      payload
    };

    return response.result;
  }

  async unsubscribe(payload: RPCRequestPayload<any[]>) {
    const subscriptionId = payload.params[0];
    if (this.hasSubscription(subscriptionId)) {
      return this.send(payload).then((response) => {
        if (response) {
          this.removeEventListener(this.getSubscriptionEvent(subscriptionId));
          delete this.subscriptions[subscriptionId];
        }

        return response;
      });
    }

    return Promise.reject(new Error(`Provider error: Subscription with ID ${subscriptionId} does not exist.`));
  }

  async clearSubscriptions(unsubscribeMethod: string) {
    const unsubscribePromises: Array<Promise<any>> = [];

    Object.keys(this.subscriptions).forEach((key) => {
      this.removeEventListener(key);
      unsubscribePromises.push(this.unsubscribe(this.jsonRpc.toPayload(unsubscribeMethod, this.subscriptions[key].id)));
    });

    const results = await Promise.all(unsubscribePromises);
    if (results.includes(false)) {
      throw new Error(`Could not unsubscribe all subscriptions: ${JSON.stringify(results)}`);
    }
    return true;
  }

  registerEventListeners() {
    this.connection.onmessage = this.onMessage.bind(this);
    this.connection.onopen = this.onReady.bind(this);
    this.connection.onopen = this.onConnect.bind(this);
    this.connection.onclose = this.onClose.bind(this);
    this.connection.onerror = this.onError.bind(this);
  }

  onMessage(msg: MessageEvent) {
    if (msg && msg.data) {
      let result;
      let event;
      try {
        result = isObject(msg.data) ? msg.data : JSON.parse(msg.data);

        if (isArray(result)) {
          event = result[0].id;
        }
        // tslint:disable-next-line: prefer-conditional-expression
        if (typeof result.id === 'undefined') {
          event = this.getSubscriptionEvent(result.params.subscription) || result.params.subscription;
          // result = result.params;
        } else {
          event = result.id;
        }
      } catch (error) {
        throw error;
      }
      this.emitter.emit(SocketState.SOCKET_MESSAGE, result);
      this.emitter.emit(`${event}`, result);
    } else {
      throw new Error('provider error');
    }
  }

  async onConnect() {
    if (!this.subscriptions) {
      this.subscriptions = {};
    }
    const subscriptionKeys = Object.keys(this.subscriptions);

    if (subscriptionKeys.length > 0) {
      for (const key of subscriptionKeys) {
        const subscriptionId: any = await this.subscribe(this.subscriptions[key].payload);
        delete this.subscriptions[subscriptionId];
        this.subscriptions[key].id = subscriptionId;
      }
    }
    this.emitter.emit(SocketState.SOCKET_CONNECT);
    this.emitter.emit(SocketConnection.CONNECT);
    if (this.connection.readyState === 1) {
      this.emitter.emit(SocketState.SOCKET_READY);
      this.emitter.emit(SocketConnection.READY);
    }
  }
  getSubscriptionEvent(subscriptionId: any) {
    if (this.subscriptions[subscriptionId]) {
      return subscriptionId;
    }

    let event;
    Object.keys(this.subscriptions).forEach((key) => {
      if (this.subscriptions[key].id === subscriptionId) {
        event = key;
      }
    });

    return event;
  }
  hasSubscription(subscriptionId: string) {
    return typeof this.getSubscriptionEvent(subscriptionId) !== 'undefined';
  }
  validate(response: any, payload?: any) {
    if (isObject(response)) {
      if (response.error) {
        if (response.error instanceof Error) {
          return new Error(`Node error: ${response.error.message}`);
        }

        return new Error(`Node error: ${JSON.stringify(response.error)}`);
      }

      if (payload && response.id !== payload.id) {
        return new Error(
          `Validation error: Invalid JSON-RPC response ID (request: ${payload.id} / response: ${response.id})`
        );
      }

      if (response.result === undefined) {
        return new Error('Validation error: Undefined JSON-RPC result');
      }

      return true;
    }

    return new Error('Validation error: Response should be of type Object');
  }
}

export { WSProvider };
