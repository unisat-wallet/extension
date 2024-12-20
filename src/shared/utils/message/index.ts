/**
 * this script is live in content-script / dapp's page
 */
import { EventEmitter } from 'events';

import { providerErrors, rpcErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { SerializedWalletError, WalletError } from '@/shared/types/Error';
import { ListenCallback, RequestParams } from '@/shared/types/Request.js';
import { SendPayload, SendRequestPayload, SendResponsePayload } from '../../types/Message';
import { deserializeError, serializeError } from '../errors';

abstract class Message extends EventEmitter {
    // available id list
    protected _EVENT_PRE = 'OPNET_WALLET_';
    protected listenCallback?: ListenCallback;

    // max concurrent request limit
    private _requestIdPool = [...Array(500).keys()];
    private _waitingMap = new Map<
        number,
        {
            data: RequestParams;
            resolve: (arg: unknown) => void;
            reject: (arg: WalletError) => void;
        }
    >();

    abstract send(type: string, data: SendPayload): void;

    request = (data: RequestParams) => {
        const ident = this._requestIdPool.shift();
        if (ident === undefined) {
            throw rpcErrors.limitExceeded();
        }

        return new Promise((resolve, reject) => {
            this._waitingMap.set(ident, {
                data,
                resolve,
                reject
            });

            try {
                this.send('request', { ident, data });
            } catch (e) {
                this._waitingMap.delete(ident);
                const error = e instanceof Error ? e : new Error('Unknown error during message send')
                reject(error);
            }
        });
    };

    onResponse = ({ ident, res, err }: SendResponsePayload) => {
        // the url may update
        const waitingRequest = this._waitingMap.get(ident);
        if (!waitingRequest) {
            return;
        }

        const { reject, resolve } = waitingRequest;

        this._requestIdPool.push(ident);
        this._waitingMap.delete(ident);
        if (err) {
            reject(deserializeError(err));
        } else {
            resolve(res);
        }
    };

    onRequest = async ({ ident, data }: SendRequestPayload) => {
        if (this.listenCallback) {
            let res;
            let err: SerializedWalletError | undefined;

            try {
                res = await this.listenCallback(data);
            } catch (_e) {
                const e = _e as WalletError;
                err = serializeError(e);
            }

            this.send('response', { ident, res, err });
        }
    };

    _dispose = () => {
        const userRejectedRequest = providerErrors.userRejectedRequest();
        for (const request of this._waitingMap.values()) {
            request.reject(userRejectedRequest);
        }

        this._waitingMap.clear();
    };
}

export default Message;
