import { BaseProvider } from './baseProvider';
import { fetchRPC } from './defaultFetcher';
import { composeMiddleware, performRPC, DEFAULT_TIMEOUT, DEFAULT_HEADERS } from './rpcMethod/net';

import { RPCRequestPayload } from './types';

/** @hidden */
const defaultOptions = {
  method: 'POST',
  timeout: DEFAULT_TIMEOUT,
  headers: DEFAULT_HEADERS,
  user: null,
  password: null
};

class HttpProvider extends BaseProvider {
  url: string;
  fetcher?: any;
  options?: any;
  constructor(url: string, options?: any, fetcher?: any) {
    super(url);
    this.url = url || 'http://localhost:9500';
    this.fetcher = fetcher || fetchRPC;
    if (options) {
      this.options = {
        method: options.method || defaultOptions.method,
        timeout: options.timeout || defaultOptions.timeout,
        user: options.user || defaultOptions.user,
        password: options.password || defaultOptions.password,
        headers: options.headers || defaultOptions.headers
      };
    } else {
      this.options = defaultOptions;
    }
  }

  /**
   * @function send
   * @memberof HttpProvider.prototype
   * @param  {Object} payload  - payload object
   * @param  {Function} callback - callback function
   * @return {any} - RPC Response
   */
  send(payload: RPCRequestPayload<object>, callback?: any): Promise<any> {
    return this.requestFunc({ payload, callback });
  }

  /**
   * @function sendServer
   * @memberof HttpProvider.prototype
   * @param  {String} endpoint - endpoint to server
   * @param  {Object} payload  - payload object
   * @param  {Function} callback - callback function
   * @return {Function} - RPC Response
   */
  sendServer(endpoint: string, payload: RPCRequestPayload<object>, callback: any): Promise<any> {
    return this.requestFunc({ endpoint, payload, callback });
  }

  requestFunc({
    endpoint,
    payload,
    callback
  }: {
    endpoint?: string;
    payload: RPCRequestPayload<object>;
    callback?: any;
  }): Promise<any> {
    const [tReq, tRes] = this.getMiddleware(payload.method);
    const reqMiddleware = composeMiddleware(
      ...tReq,
      (obj: object) => this.optionsHandler(obj),
      (obj: object) => this.endpointHandler(obj, endpoint),
      this.payloadHandler
    );
    const resMiddleware = composeMiddleware((data: object) => this.callbackHandler(data, callback), ...tRes);

    const req = reqMiddleware(payload);

    return performRPC(req, resMiddleware, this.fetcher);
  }

  /**
   * @function payloadHandler
   * @memberof HttpProvider.prototype
   * @param  {Object} payload - payload object
   * @return {Object} - to payload object
   */
  payloadHandler(payload: RPCRequestPayload<object>): object {
    return { payload };
  }

  /**
   * @function endpointHandler
   * @memberof HttpProvider.prototype
   * @param  {Object} obj      - payload object
   * @param  {String} endpoint - add the endpoint to payload object
   * @return {Object} - assign a new object
   */
  endpointHandler(obj: object, endpoint?: string): object {
    return {
      ...obj,
      url: endpoint !== null && endpoint !== undefined ? `${this.url}${endpoint}` : this.url
    };
  }

  /**
   * @function optionsHandler
   * @memberof HttpProvider.prototype
   * @param  {object} obj - options object
   * @return {object} - assign a new option object
   */
  optionsHandler(obj: object): object {
    if (this.options.user && this.options.password) {
      const AUTH_TOKEN = `Basic ${Buffer.from(`${this.options.user}:${this.options.password}`).toString('base64')}`;
      this.options.headers.Authorization = AUTH_TOKEN;
    }

    return { ...obj, options: this.options };
  }

  /**
   * @function callbackHandler
   * @memberof HttpProvider.prototype
   * @param  {Object} data - from server
   * @param  {Function} cb   - callback function
   * @return {Object|Function} - return object or callback function
   */
  callbackHandler(data: any, cb: any): any {
    if (cb) {
      cb(null, data);
    }
    return data;
  }

  subscribe() {
    throw new Error('HTTPProvider does not support subscriptions.');
  }

  unsubscribe() {
    throw new Error('HTTPProvider does not support subscriptions.');
  }
}

export { HttpProvider };
