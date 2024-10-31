import { SerializedWalletError } from "./Error";
import { RequestParams } from "./Request";

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