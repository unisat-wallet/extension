import { Session } from '@/background/service/session';

export interface RequestParams {
    readonly method: string;
    readonly type?: string;
    readonly params?: object;
}

export interface ProviderControllerRequest {
    data: RequestParams;
    session: Session;
}

export type ListenCallback = ((data: RequestParams) => Promise<unknown>) | undefined;
