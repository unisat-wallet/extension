// this script is injected into webpage's context
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import { CosmosChainInfo } from '@/shared/constant/cosmosChain';
import { TxType } from '@/shared/types';
import { objToUint8Array } from '@/shared/utils';
import BroadcastChannelMessage from '@/shared/utils/message/broadcastChannelMessage';

import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import { $, domReadyCall } from './utils';

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // console.log(
    //   `%c [unisat] (${new Date().toTimeString().slice(0, 8)}) ${event}`,
    //   'font-weight: 600; background-color: #7d6ef9; color: white;',
    //   ...args
    // );
  }
};
const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'UNISAT';

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

const EXTENSION_CONTEXT_INVALIDATED_CHROMIUM_ERROR = 'Extension context invalidated.';

const _unisatPrividerPrivate: {
  _selectedAddress: string | null;
  _network: string | null;
  _isConnected: boolean;
  _initialized: boolean;
  _isUnlocked: boolean;

  _state: StateProvider;

  _pushEventHandlers: PushEventHandlers | null;
  _requestPromise: ReadyPromise;
  _bcm: BroadcastChannelMessage;
} = {
  _selectedAddress: null,
  _network: null,
  _isConnected: false,
  _initialized: false,
  _isUnlocked: false,

  _state: {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false
  },

  _pushEventHandlers: null,
  _requestPromise: new ReadyPromise(0),
  _bcm: new BroadcastChannelMessage(channelName)
};

let cache_origin = '';

export class UnisatProvider extends EventEmitter {
  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    _unisatPrividerPrivate._pushEventHandlers = new PushEventHandlers(this, _unisatPrividerPrivate);
  }

  tryDetectTab = async () => {
    const origin = window.top?.location.origin;
    if (origin && cache_origin !== origin) {
      cache_origin = origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name = document.title || ($('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;
      _unisatPrividerPrivate._bcm.request({
        method: 'tabCheckin',
        params: { icon, name, origin }
      });
    }
  };

  initialize = async () => {
    document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);

    _unisatPrividerPrivate._bcm.connect().on('message', this._handleBackgroundMessage);

    this.tryDetectTab();
    domReadyCall(() => {
      this.tryDetectTab();
    });

    try {
      const { network, accounts, isUnlocked }: any = await this._request({
        method: 'getProviderState'
      });
      if (isUnlocked) {
        _unisatPrividerPrivate._isUnlocked = true;
        _unisatPrividerPrivate._state.isUnlocked = true;
      }
      this.emit('connect', {});
      _unisatPrividerPrivate._pushEventHandlers?.networkChanged({
        network
      });

      _unisatPrividerPrivate._pushEventHandlers?.accountsChanged(accounts);
    } catch {
      //
    } finally {
      _unisatPrividerPrivate._initialized = true;
      _unisatPrividerPrivate._state.initialized = true;
      this.emit('_initialized');
    }

    this.keepAlive();
  };

  /**
   * Sending a message to the extension to receive will keep the service worker alive.
   */
  private keepAlive = () => {
    this._request({
      method: 'keepAlive',
      params: {}
    }).then((v) => {
      setTimeout(() => {
        this.keepAlive();
      }, 1000);
    });
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === 'visible') {
      _unisatPrividerPrivate._requestPromise.check(1);
    } else {
      _unisatPrividerPrivate._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    log('[push event]', event, data);
    if (_unisatPrividerPrivate._pushEventHandlers?.[event]) {
      return _unisatPrividerPrivate._pushEventHandlers[event](data);
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

    return _unisatPrividerPrivate._requestPromise.call(() => {
      log('[request]', JSON.stringify(data, null, 2));
      return _unisatPrividerPrivate._bcm
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
  requestAccounts = async () => {
    return this._request({
      method: 'requestAccounts'
    });
  };

  disconnect = async () => {
    return this._request({
      method: 'disconnect'
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

  getChain = async () => {
    return this._request({
      method: 'getChain'
    });
  };

  switchChain = async (chain: string) => {
    return this._request({
      method: 'switchChain',
      params: {
        chain
      }
    });
  };

  getAccounts = async () => {
    return this._request({
      method: 'getAccounts'
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

  getBalanceV2 = async () => {
    return this._request({
      method: 'getBalanceV2'
    });
  };

  getInscriptions = async (cursor = 0, size = 20) => {
    return this._request({
      method: 'getInscriptions',
      params: {
        cursor,
        size
      }
    });
  };

  signMessage = async (text: string, type: string) => {
    return this._request({
      method: 'signMessage',
      params: {
        text,
        type
      }
    });
  };

  verifyMessageOfBIP322Simple = async (address: string, message: string, signature: string, network?: number) => {
    return this._request({
      method: 'verifyMessageOfBIP322Simple',
      params: {
        address,
        message,
        signature,
        network
      }
    });
  };

  signData = async (data: string, type: string) => {
    return this._request({
      method: 'signData',
      params: {
        data,
        type
      }
    });
  };

  sendBitcoin = async (
    toAddress: string,
    satoshis: number,
    options?: { feeRate: number; memo?: string; memos?: string[] }
  ) => {
    return this._request({
      method: 'sendBitcoin',
      params: {
        sendBitcoinParams: {
          toAddress,
          satoshis,
          feeRate: options?.feeRate,
          memo: options?.memo,
          memos: options?.memos
        },
        type: TxType.SEND_BITCOIN
      }
    });
  };

  sendInscription = async (toAddress: string, inscriptionId: string, options?: { feeRate: number }) => {
    return this._request({
      method: 'sendInscription',
      params: {
        sendInscriptionParams: {
          toAddress,
          inscriptionId,
          feeRate: options?.feeRate
        },
        type: TxType.SEND_ORDINALS_INSCRIPTION
      }
    });
  };

  sendRunes = async (toAddress: string, runeid: string, amount: string, options?: { feeRate: number }) => {
    return this._request({
      method: 'sendRunes',
      params: {
        sendRunesParams: {
          toAddress,
          runeid,
          amount,
          feeRate: options?.feeRate
        },
        type: TxType.SEND_RUNES
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

  signPsbt = async (psbtHex: string, options?: any) => {
    return this._request({
      method: 'signPsbt',
      params: {
        psbtHex,
        type: TxType.SIGN_TX,
        options
      }
    });
  };

  signPsbts = async (psbtHexs: string[], options?: any[]) => {
    return this._request({
      method: 'multiSignPsbt',
      params: {
        psbtHexs,
        options
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

  inscribeTransfer = async (ticker: string, amount: string) => {
    return this._request({
      method: 'inscribeTransfer',
      params: {
        ticker,
        amount
      }
    });
  };

  getVersion = async () => {
    return this._request({
      method: 'getVersion'
    });
  };

  isAtomicalsEnabled = async () => {
    return this._request({
      method: 'isAtomicalsEnabled'
    });
  };

  getBitcoinUtxos = async (cursor = 0, size = 20) => {
    return this._request({
      method: 'getBitcoinUtxos',
      params: {
        cursor,
        size
      }
    });
  };

  // cosmos
  keplr = {
    enable: async (chainId: string) => {
      return this._request({
        method: 'cosmos_enable',
        params: {
          chainId
        }
      });
    },

    experimentalSuggestChain: async (chainData: CosmosChainInfo) => {
      return this._request({
        method: 'cosmos_experimentalSuggestChain',
        params: {
          chainData
        }
      });
    },

    getKey: async (chainId: string) => {
      const _key: any = await this._request({
        method: 'cosmos_getKey',
        params: {
          chainId
        }
      });

      const key = Object.assign({}, _key, {
        address: Uint8Array.from(_key.address.split(',')),
        pubKey: Uint8Array.from(_key.pubKey.split(','))
      });

      return key;
    },

    getOfflineSigner: (chainId: string, signOptions?: any) => {
      return new CosmJSOfflineSigner(chainId, this, signOptions);
    },

    signArbitrary: async (chainId: string, signerAddress: string, data: string | Uint8Array) => {
      return this._request({
        method: 'cosmos_signArbitrary',
        params: {
          chainId,
          signerAddress,
          type: typeof data === 'string' ? 'string' : 'Uint8Array',
          data: typeof data === 'string' ? data : Buffer.from(data).toString('base64'),
          origin: window.location.origin
        }
      });
    }
  };
}

class CosmJSOfflineSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly provider: UnisatProvider,
    protected readonly signOptions?: any
  ) {}

  async getAccounts() {
    const key: any = await this.provider.keplr.getKey(this.chainId);
    return [
      {
        address: key.bech32Address,
        algo: key.algo,
        pubkey: key.pubKey
      }
    ];
  }

  async signDirect(signerAddress: string, signDoc: any) {
    const response: any = await this.provider._request({
      method: 'cosmos_signDirect',
      params: {
        signerAddress,
        signDoc: {
          bodyBytes: signDoc.bodyBytes,
          authInfoBytes: signDoc.authInfoBytes,
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString()
        }
      }
    });
    return {
      signed: {
        bodyBytes: objToUint8Array(response.signed.bodyBytes),
        authInfoBytes: objToUint8Array(response.signed.authInfoBytes),
        chainId: response.signed.chainId.toString(),
        accountNumber: response.signed.accountNumber.toString()
      },
      signature: response.signature
    };
  }
}

declare global {
  interface Window {
    unisat: UnisatProvider;
  }
}

function defineUnwritablePropertyIfPossible(o: any, p: string, value: any) {
  const descriptor = Object.getOwnPropertyDescriptor(o, p);
  if (!descriptor || descriptor.writable) {
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(o, p, {
        value,
        writable: false
      });
    } else {
      o[p] = value;
    }
  } else {
    console.warn(`Failed to inject ${p} from unisat. Probably, other wallet is trying to intercept UniSat Wallet`);
  }
}

const provider = new UnisatProvider();
const providerProxy = new Proxy(provider, {
  deleteProperty: () => true
});

defineUnwritablePropertyIfPossible(window, 'unisat', providerProxy);

// Many wallets occupy the window.unisat namespace, so we need to use a different namespace to avoid conflicts.
defineUnwritablePropertyIfPossible(window, 'unisat_wallet', providerProxy);

window.dispatchEvent(new Event('unisat#initialized'));
