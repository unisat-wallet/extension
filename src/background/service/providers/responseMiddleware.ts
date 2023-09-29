import { RPCResponseBody } from './types';
import { isObject } from './utils';
/**
 * @class ResponseMiddleware
 * @description Response middleware of RPC
 * @param  {Object}  ResponseBody - response from rpc
 * @return {ResponseMiddleware} response middleware instance
 */
class ResponseMiddleware {
  result: any;
  error: any;
  raw: any;
  responseType: string;
  constructor(ResponseBody: RPCResponseBody<any, any>) {
    this.result = ResponseBody.result;
    this.error = ResponseBody.error;
    this.raw = ResponseBody;
    this.responseType = this.getResponseType();
  }

  get getResult() {
    return isObject(this.result) ? { ...this.result, responseType: 'result' } : this.result;
  }

  get getError() {
    return isObject(this.error) ? { ...this.error, responseType: 'error' } : this.error;
  }

  get getRaw() {
    return { ...this.raw, responseType: 'raw' };
  }

  getResponseType(): string {
    if (this.error) {
      return 'error';
    } else if (this.result || (this.result === null && this.result !== undefined)) {
      return 'result';
    } else {
      return 'raw';
    }
  }

  isError(): boolean {
    return this.responseType === 'error';
  }
  isResult(): boolean {
    return this.responseType === 'result';
  }
  isRaw(): boolean {
    return this.responseType === 'raw';
  }
}

export function getResultForData(data: any): any {
  if (data.result) {
    return data.getResult;
  }
  if (data.error) {
    return data.getError;
  }
  return data.getRaw;
}

export function getRawForData(data: any): any {
  return data.getRaw;
}

export function onResponse(response: ResponseMiddleware) {
  if (response.responseType === 'result') {
    return response.getResult;
  } else if (response.responseType === 'error') {
    return response.getError;
  } else {
    return response.raw;
  }
}

export { ResponseMiddleware };
