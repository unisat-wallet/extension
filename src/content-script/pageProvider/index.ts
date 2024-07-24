// this script is injected into webpage's context
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';
import { BroadcastedTransaction } from 'opnet';

import { TxType } from '@/shared/types';
import { RequestParams } from '@/shared/types/Request.js';
import BroadcastChannelMessage from '@/shared/utils/message/broadcastChannelMessage';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { UTXO } from '@btc-vision/transaction';

import { BroadcastTransactionOptions, InteractionParametersWithoutSigner, Web3Provider } from './Web3Provider';
import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import { $, domReadyCall } from './utils';


const log = (event: string, ...args: unknown[]) => {
  /*if (process && process.env.NODE_ENV !== 'production') {
                              console.log(
                                 `%c [unisat] (${new Date().toTimeString().slice(0, 8)}) ${event}`,
                                 'font-weight: 600; background-color: #7d6ef9; color: white;',
                                 ...args
                              );
                            }*/
};

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'UNISAT';

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

  public readonly web3: Web3Provider = new Web3Provider(this);

  private readonly _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(0);

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

      // Do not force to tabCheckin
      // this._requestPromise.check(2);
    });

    try {
      const { network, chain, accounts, isUnlocked }: any = await this._request({
        method: 'getProviderState'
      });

      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.emit('connect', {});
      this._pushEventHandlers.networkChanged({
        network,
        chain
      });

      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit('_initialized');
    }

    void this.keepAlive();
  };

  /**
   * Sending a message to the extension to receive will keep the service worker alive.
   */
  private keepAlive = async () => {
    try {
      await this._request({
        method: 'keepAlive',
        params: {}
      });
    } catch (e) {
      log('[keepAlive: error]', serializeError(e));
    }

    setTimeout(() => {
      this.keepAlive();
    }, 1000);
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

  _request = async (data: RequestParams) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise
      .call(async () => {
        log('[request]', JSON.stringify(data, null, 2));

        const res = await this._bcm.request(data).catch((err) => {
          log('[request: error]', data.method, serializeError(err));
          throw serializeError(err);
        });

        log('[request: success]', data.method, res);

        return res;
      })
      .catch((err) => {
        throw err;
      });
  };

  // public methods
  requestAccounts = async () => {
    return this._request({
      method: 'requestAccounts'
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
  ): Promise<string> => {
    return (await this._request({
      method: 'sendBitcoin',
      params: {
        toAddress,
        satoshis,
        feeRate: options?.feeRate,
        memo: options?.memo,
        memos: options?.memos,
        type: TxType.SEND_BITCOIN
      }
    })) as Promise<string>;
  };

  signInteraction = async (
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[string, string, UTXO[]]> => {
    const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(
      interactionParameters.to
    );

    return (await this._request({
      method: 'signInteraction',
      params: {
        interactionParameters: {
          ...interactionParameters,
          calldata: interactionParameters.calldata.toString('hex')
        },
        contractInfo: contractInfo
      }
    })) as Promise<[string, string, UTXO[]]>;
  };

  signAndBroadcastInteraction = async (
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[BroadcastedTransaction, BroadcastedTransaction, UTXO[]]> => {
    const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(
      interactionParameters.to
    );

    return (await this._request({
      method: 'signAndBroadcastInteraction',
      params: {
        interactionParameters: {
          ...interactionParameters,
          calldata: interactionParameters.calldata.toString('hex')
        },
        contractInfo: contractInfo
      }
    })) as Promise<[BroadcastedTransaction, BroadcastedTransaction, UTXO[]]>;
  };

  broadcast = async (transactions: BroadcastTransactionOptions[]): Promise<BroadcastedTransaction[]> => {
    return (await this._request({
      method: 'broadcast',
      params: transactions
    })) as Promise<[BroadcastedTransaction, BroadcastedTransaction]>;
  };

  sendInscription = async (toAddress: string, inscriptionId: string, options?: { feeRate: number }) => {
    return this._request({
      method: 'sendInscription',
      params: {
        toAddress,
        inscriptionId,
        feeRate: options?.feeRate,
        type: TxType.SEND_ORDINALS_INSCRIPTION
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
}

const provider = new UnisatProvider();

if (!window.unisat) {
  window.unisat = new Proxy(provider, {
    deleteProperty: () => true
  }) as any;
}

Object.defineProperty(window, 'unisat', {
  value: new Proxy(provider, {
    deleteProperty: () => true
  }),
  writable: false
});

window.dispatchEvent(new Event('unisat#initialized'));
