import { browserRuntimeConnect } from '@/background/webapi/browser';

import Message from './index';
import { ListenCallback, RequestData } from '@/types/Request.js';

// Make bigint serializable
BigInt.prototype.toJSON = function () {
  return this.toString();
};

class PortMessage extends Message {
  port: chrome.runtime.Port | null = null;
  listenCallback?: ListenCallback;

  constructor(port?: chrome.runtime.Port) {
    super();

    if (port) {
      this.port = port;
    }
  }

  connect = (name?: string) => {
    this.port = browserRuntimeConnect(undefined, name ? { name } : undefined);
    this.port.onMessage.addListener(async ({ _type_, data }): Promise<void> => {
      if (_type_ === `${this._EVENT_PRE}message`) {
        this.emit('message', data);
        return;
      }

      if (_type_ === `${this._EVENT_PRE}response`) {
        await this.onResponse(data);
      }
    });

    return this;
  };

  listen = (listenCallback: ListenCallback) => {
    if (!this.port) return;
    this.listenCallback = listenCallback;
    this.port.onMessage.addListener(async ({ _type_, data }): Promise<void> => {
      if (_type_ === `${this._EVENT_PRE}request`) {
        await this.onRequest(data);
      }
    });

    return this;
  };

  send = (type: string, data: RequestData) => {
    if (!this.port) return;

    //try {
      this.port.postMessage({ _type_: `${this._EVENT_PRE}${type}`, data });
    //} catch (e) {
      // DO NOTHING BUT CATCH THIS ERROR
    //}
  };

  dispose = () => {
    this._dispose();
    this.port?.disconnect();

    this.port = null;
  };
}

export default PortMessage;
