import { MESSAGE_TYPE } from '@unisat/wallet-shared';
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
      if (type === MESSAGE_TYPE.BCM_CONTENT_TO_CHANNEL) {
        this.emit(MESSAGE_TYPE.BCM_CHANNEL_TO_PAGE, data);
      } else if (type === MESSAGE_TYPE.RESPONSE) {
        this.onResponse(data);
      }
    };

    return this;
  };

  listen = (listenCallback) => {
    this.listenCallback = listenCallback;

    this._channel.onmessage = ({ data: { type, data } }) => {
      if (type === MESSAGE_TYPE.REQUEST) {
        this.onRequest(data);
      }
    };

    return this;
  };

  send = (type, data) => {
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
