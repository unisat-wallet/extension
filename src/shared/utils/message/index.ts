/**
 * this script is live in content-script / dapp's page
 */
import { ethErrors } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import { ListenCallback, RequestParams } from '@/shared/types/Request.js';

abstract class Message extends EventEmitter {
    // available id list
    protected _EVENT_PRE = 'OPNET_WALLET_';
    protected listenCallback?: ListenCallback;

    // max concurrent request limit
    private _requestIdPool = [...Array(500).keys()];
    private _waitingMap = new Map<
        number,
        {
            data: any;
            resolve: (arg: any) => any;
            reject: (arg: any) => any;
        }
    >();

    abstract send(type: string, data: any): void;

    request = (data: RequestParams) => {
        if (!this._requestIdPool.length) {
            throw ethErrors.rpc.limitExceeded();
        }
        const ident = this._requestIdPool.shift()!;

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
                reject(e);
            }
        });
    };

    onResponse = ({ ident, res, err }: any = {}) => {
        // the url may update
        if (!this._waitingMap.has(ident)) {
            return;
        }

        const { resolve, reject } = this._waitingMap.get(ident)!;

        this._requestIdPool.push(ident);
        this._waitingMap.delete(ident);
        err ? reject(err) : resolve(res);
    };

    onRequest = async ({ ident, data }) => {
        if (this.listenCallback) {
            let res, err;

            try {
                res = await this.listenCallback(data);
            } catch (_e) {
                const e = _e as Error & { code?: number; data?: unknown };

                err = {
                    message: e.message,
                    stack: e.stack
                };
                e.code && (err.code = e.code);
                e.data && (err.data = e.data);
            }

            this.send('response', { ident, res, err });
        }
    };

    _dispose = () => {
        for (const request of this._waitingMap.values()) {
            request.reject(ethErrors.provider.userRejectedRequest());
        }

        this._waitingMap.clear();
    };
}

export default Message;
