import { RequestParams } from '@/shared/types/Request.js';

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
    this._channel.onmessage = async ({ data: { type, data } }) => {
      if (type === 'message') {
        this.emit('message', data);
      } else if (type === 'response') {
        await this.onResponse(data);
      }
    };

    return this;
  };

  // eslint-disable-next-line no-unused-vars
  listen = (listenCallback: (_: RequestParams) => Promise<unknown>) => {
    this.listenCallback = listenCallback;

    this._channel.onmessage = async ({ data: { type, data } }) => {
      if (type === 'request') {
        await this.onRequest(data);
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
