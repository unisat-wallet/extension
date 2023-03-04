// this script is injected into webpage's context
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import BroadcastChannelMessage from '@/shared/utils/message/broadcastChannelMessage';

import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import { $, domReadyCall } from './utils';

const channelName = 'UNISAT';

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `%c [unisat] (${new Date().toTimeString().slice(0, 8)}) ${event}`,
      'font-weight: 600; background-color: #7d6ef9; color: white;',
      ...args
    );
  }
};

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export class UnisatProvider extends EventEmitter {
  _selectedAddress: string | null = null;
  _network: string | null = null;
  _isConnected = false;
  _initialized = false;
  _isUnlocked = false;

  _state: StateProvider = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false
  };

  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(2);

  private _bcm = new BroadcastChannelMessage(channelName);

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async () => {
    document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);

    this._bcm.connect().on('message', this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = window.top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name = document.title || ($('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;

      this._bcm.request({
        method: 'tabCheckin',
        params: { icon, name, origin }
      });

      this._requestPromise.check(2);
    });

    try {
      const { network, accounts, isUnlocked }: any = await this._request({
        method: 'getProviderState'
      });
      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.emit('connect', {});
      this._pushEventHandlers.chainChanged({
        network
      });

      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit('_initialized');
    }
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === 'visible') {
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    log('[push event]', event, data);
    if (this._pushEventHandlers[event]) {
      return this._pushEventHandlers[event](data);
    }

    this.emit(event, data);
  };
  // TODO: support multi request!
  // request = async (data) => {
  //   return this._request(data);
  // };

  _request = async (data) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      log('[request]', JSON.stringify(data, null, 2));
      return this._bcm
        .request(data)
        .then((res) => {
          log('[request: success]', data.method, res);
          return res;
        })
        .catch((err) => {
          log('[request: error]', data.method, serializeError(err));
          throw serializeError(err);
        });
    });
  };

  // public methods

  isConnected = () => {
    return this._request({
      method: 'isConnected'
    });
  };

  connect = async () => {
    return this._request({
      method: 'connect'
    });
  };

  getNetwork = async () => {
    return this._request({
      method: 'getNetwork'
    });
  };

  switchNetwork = async (network: string) => {
    return this._request({
      method: 'switchNetwork',
      params: {
        network
      }
    });
  };

  getAddress = async () => {
    return this._request({
      method: 'getAddress'
    });
  };

  getPublicKey = async () => {
    return this._request({
      method: 'getPublicKey'
    });
  };

  getBalance = async () => {
    return this._request({
      method: 'getBalance'
    });
  };

  getInscriptions = async () => {
    return this._request({
      method: 'getInscriptions'
    });
  };

  signText = async (text: string) => {
    return this._request({
      method: 'signText',
      params: {
        text
      }
    });
  };

  // signTx = async (rawtx: string) => {
  //   return this._request({
  //     method: 'signTx',
  //     params: {
  //       rawtx
  //     }
  //   });
  // };

  /**
   * push transaction
   */
  pushTx = async (rawtx: string) => {
    return this._request({
      method: 'pushTx',
      params: {
        rawtx
      }
    });
  };

  signPsbt = async (psbtHex: string) => {
    return this._request({
      method: 'signPsbt',
      params: {
        psbtHex
      }
    });
  };

  pushPsbt = async (psbtHex: string) => {
    return this._request({
      method: 'pushPsbt',
      params: {
        psbtHex
      }
    });
  };
}

declare global {
  interface Window {
    unisat: UnisatProvider;
  }
}

const provider = new UnisatProvider();

Object.defineProperty(window, 'unisat', {
  value: new Proxy(provider, {
    deleteProperty: () => true
  }),
  writable: false
});

if (!window.unisat) {
  window.unisat = new Proxy(provider, {
    deleteProperty: () => true
  });
}
window.dispatchEvent(new Event('unisat#initialized'));
