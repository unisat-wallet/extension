import { RequestParams } from '@/shared/types/Request.js';

import { SendMessagePayload, SendRequestPayload, SendResponsePayload } from '@/shared/types/Message';
import Message from './index';

export default class BroadcastChannelMessage extends Message {
    private _channel: BroadcastChannel;

    constructor(name?: string) {
        super();
        if (!name) {
            throw new Error('the broadcastChannel name is missing');
        }

        this._channel = new BroadcastChannel(name);
    }

    connect = () => {
        this._channel.onmessage = ({ data: { type, data } }) => {
            if (type === 'message') {
                this.emit('message', data as SendMessagePayload);
            } else if (type === 'response') {
                this.onResponse(data as SendResponsePayload);
            }
        };

        return this;
    };

     
    listen = (listenCallback: (_: RequestParams) => Promise<unknown>) => {
        this.listenCallback = listenCallback;

        this._channel.onmessage = async ({ data: { type, data } }) => {
            if (type === 'request') {
                await this.onRequest(data as SendRequestPayload);
            }
        };

        return this;
    };

    send = (type: string, data: object) => {
        this._channel.postMessage({
            type,
            data
        });
    };

    dispose = () => {
        this._dispose();
        this._channel.close();
    };
}
