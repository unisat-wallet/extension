export interface RequestParams {
    readonly method: string;
    readonly type?: string;
    readonly params?: object;
}

export interface ProviderControllerRequest {
    data: RequestParams;
    session: Session;
}

export interface Session {
    origin: string;
    name: string;
    icon: string;
}

export type ListenCallback = ((data: RequestParams) => Promise<unknown>) | undefined;
