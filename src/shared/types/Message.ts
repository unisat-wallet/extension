import { SessionEvent, SessionEventPayload } from "../interfaces/SessionEvent";
import { SerializedWalletError } from "./Error";
import { RequestParams } from "./Request";

export interface MessageDetails {
    _type_: string;
    data: SendPayload;
}

export type SendPayload = SendMessagePayload | SendRequestPayload | SendResponsePayload;

export interface SendMessagePayload<T extends SessionEvent = SessionEvent> {
    event: T;
    data?: SessionEventPayload<T>;
}

export interface SendRequestPayload {
    ident: number;
    data: RequestParams;
}

export interface SendResponsePayload {
    ident: number;
    res: any;
    err?: SerializedWalletError;
}