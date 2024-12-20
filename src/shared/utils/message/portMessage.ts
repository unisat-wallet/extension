import { browserRuntimeConnect } from '@/background/webapi/browser';
import { ListenCallback } from '@/shared/types/Request.js';

import { Runtime } from 'webextension-polyfill';
import { MessageDetails, SendMessagePayload, SendPayload, SendRequestPayload, SendResponsePayload } from '../../types/Message';
import Message from './index';


// Make bigint serializable
BigInt.prototype.toJSON = function () {
    return this.toString();
};

class PortMessage extends Message {
    port: Runtime.Port | null = null;
    
    constructor(port?: Runtime.Port) {
        super();

        if (port) {
            this.port = port;
        }
    }

    connect = (name?: string) => {
        this.port = browserRuntimeConnect(undefined, name ? { name } : undefined);
        this.port.onMessage.addListener((message): void => {
            const { _type_, data } = message as MessageDetails;

            if (_type_ === `${this._EVENT_PRE}message`) {
                this.emit('message', data as SendMessagePayload);
                return;
            }

            if (_type_ === `${this._EVENT_PRE}response`) {
                this.onResponse(data as SendResponsePayload);
            }
        });

        return this;
    };

    listen = (listenCallback: ListenCallback) => {
        if (!this.port) return;
        this.listenCallback = listenCallback;
        this.port.onMessage.addListener(async (message): Promise<void> => {
            const { _type_, data } = message as MessageDetails;
            
            if (_type_ === `${this._EVENT_PRE}request`) {
                await this.onRequest(data as SendRequestPayload);
            }
        });

        return this;
    };

    send = (type: string, data: SendPayload) => {
        if (!this.port) return;

        const messageDetails: MessageDetails = {
            _type_: `${this._EVENT_PRE}${type}`,
            data
        }

        try {
            this.port.postMessage(messageDetails);
        } catch (e) {
            //
        }
    };

    dispose = () => {
        this._dispose();
        this.port?.disconnect();

        this.port = null;
    };
}

export default PortMessage;
