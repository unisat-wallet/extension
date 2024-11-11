import { SerializedWalletError } from "./Error";
import { RequestParams } from "./Request";

export interface MessageDetails {
    _type_: string;
    data: SendPayload;
}

export type SendPayload = SendMessagePayload | SendRequestPayload | SendResponsePayload;

export interface SendMessagePayload {
    event: string;
    data: RequestParams;
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