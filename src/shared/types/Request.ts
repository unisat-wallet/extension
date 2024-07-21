export interface RequestParams {
  readonly method: string;
  readonly type?: string;
  readonly params?: object;
}

export interface RequestData {
  data: RequestParams;
  event?: string;
}

export type ListenCallback = ((data: RequestParams) => Promise<unknown>) | undefined;
