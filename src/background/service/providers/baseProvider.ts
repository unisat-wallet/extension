import { ReqMiddleware, ResMiddleware, MiddlewareType } from './types';
import { RPCMethod } from './rpcMethod/rpc';

class BaseProvider {
  middlewares = {
    request: {
      use: (fn: ReqMiddleware, match: string | RPCMethod | RegExp = '*') => {
        this.pushMiddleware(fn, MiddlewareType.REQ, match);
      },
    },
    response: {
      use: (fn: ResMiddleware, match: string | RPCMethod | RegExp = '*') => {
        this.pushMiddleware(fn, MiddlewareType.RES, match);
      },
    },
  };
  protected url: string;
  protected reqMiddleware: ReqMiddleware = new Map().set('*', []);
  protected resMiddleware: ResMiddleware = new Map().set('*', []);

  constructor(url: string, reqMiddleware: ReqMiddleware = new Map(), resMiddleware: ResMiddleware = new Map()) {
    this.reqMiddleware = reqMiddleware;
    this.resMiddleware = resMiddleware;
    this.url = url;
  }

  protected pushMiddleware(fn: any, type: MiddlewareType, match: string | RPCMethod | RegExp) {
    if (type !== MiddlewareType.REQ && type !== MiddlewareType.RES) {
      throw new Error('Please specify the type of middleware being added');
    }
    if (type === MiddlewareType.REQ) {
      const current = this.reqMiddleware.get(match) || [];
      this.reqMiddleware.set(match, [...current, <ReqMiddleware>fn]);
    } else {
      const current = this.resMiddleware.get(match) || [];
      this.resMiddleware.set(match, [...current, <ResMiddleware>fn]);
    }
  }
  protected getMiddleware(method: RPCMethod | string): [ReqMiddleware[], ResMiddleware[]] {
    const requests: ReqMiddleware[] = [];
    const responses: ResMiddleware[] = [];

    for (const [key, transformers] of this.reqMiddleware.entries()) {
      if (typeof key === 'string' && key !== '*' && key === method) {
        requests.push(...transformers);
      }

      if (key instanceof RegExp && key.test(method as string)) {
        requests.push(...transformers);
      }

      if (key === '*') {
        requests.push(...transformers);
      }
    }

    for (const [key, transformers] of this.resMiddleware.entries()) {
      if (typeof key === 'string' && key !== '*' && key === method) {
        responses.push(...transformers);
      }

      if (key instanceof RegExp && key.test(method as string)) {
        responses.push(...transformers);
      }

      if (key === '*') {
        responses.push(...transformers);
      }
    }

    return [requests, responses];
  }
}

export { BaseProvider };
