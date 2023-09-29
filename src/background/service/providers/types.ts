import { RPCMethod, RPCErrorCode } from './rpcMethod/rpc';

export type ReqMiddleware = Map<string | RPCMethod | RegExp, any[]>;
export type ResMiddleware = Map<string | RPCMethod | RegExp, any[]>;

export enum MiddlewareType {
  REQ,
  RES,
}

export enum SubscribeReturns {
  all = 'all',
  id = 'id',
  method = 'method',
}

export interface Middleware {
  request: object;
  response: object;
}

export interface RPCRequestPayload<T> {
  id: number;
  jsonrpc: string;
  method: RPCMethod | string;
  params: T;
}

export interface RPCRequestOptions {
  headers: [];
  method: string;
}

export interface RPCRequest<T> {
  url: string;
  payload: RPCRequestPayload<T>;
  options: RPCRequestOptions;
}

export interface RPCResponseBase {
  jsonrpc: string;
  id: string;
}

export interface RPCResponseBody<R, E> extends RPCResponseBase {
  result: R;
  error: E;
}

export interface RPCError {
  code: RPCErrorCode;
  message: string;
  data: any;
}

export interface RPCResult {
  resultString: string;
  resultMap: Map<string, any>;
  resultList: any[];
  raw: any;
}

export interface ShardingItem {
  current: boolean;
  shardID: number | string;
  http: string;
  ws: string;
}
