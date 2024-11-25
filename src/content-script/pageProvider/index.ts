// this script is injected into webpage's context
import { EventEmitter } from 'events';
import { BroadcastedTransaction } from 'opnet';

import { SignPsbtOptions, TxType } from '@/shared/types';
import { RequestParams } from '@/shared/types/Request.js';
import BroadcastChannelMessage from '@/shared/utils/message/broadcastChannelMessage';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { DeploymentResult, Unisat, UTXO } from '@btc-vision/transaction';

import { rpcErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { ProviderState } from '@/shared/types/Provider';
import {
    BroadcastTransactionOptions,
    IDeploymentParametersWithoutSigner,
    InteractionParametersWithoutSigner,
    Web3Provider
} from './Web3Provider';
import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import { $, domReadyCall } from './utils';

declare global {
    interface Window {
        opnet?: Unisat;
        unisat?: Unisat;
    }
}

const log = (event: string, ...args: unknown[]) => {
    /*if (process && process.env.NODE_ENV !== 'production') {
                            console.log(
                               `%c [unisat] (${new Date().toTimeString().slice(0, 8)}) ${event}`,
                               'font-weight: 600; background-color: #7d6ef9; color: white;',
                               ...args
                            );
                          }*/
};

//declare const window: any

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'OPNET';

interface StateProvider {
    accounts: string[] | null;
    isConnected: boolean;
    isUnlocked: boolean;
    initialized: boolean;
    isPermanentlyDisconnected: boolean;
}

export interface OpnetProviderPrivate {
    _selectedAddress: string | null;
    _network: string | null;
    _isConnected: boolean;
    _initialized: boolean;
    _isUnlocked: boolean;

    _state: StateProvider;

    _pushEventHandlers: PushEventHandlers | null;
    _requestPromise: ReadyPromise;
    _bcm: BroadcastChannelMessage;
}

const _opnetPrividerPrivate: OpnetProviderPrivate = {
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

export class OpnetProvider extends EventEmitter {
    public readonly web3: Web3Provider = new Web3Provider(this);

    constructor({ maxListeners = 100 } = {}) {
        super();
        this.setMaxListeners(maxListeners);
        void this.initialize();
        _opnetPrividerPrivate._pushEventHandlers = new PushEventHandlers(this, _opnetPrividerPrivate);
    }

    initialize = async () => {
        document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);

        _opnetPrividerPrivate._bcm.connect().on('message', this._handleBackgroundMessage);
        domReadyCall(async () => {
            const origin = window.top?.location.origin;
            // @ts-ignore
            const icon = $('head > link[rel~="icon"]')?.href || $('head > meta[itemprop="image"]')?.content;

            // @ts-ignore
            const name = document.title || $('head > meta[name="title"]')?.content || origin;

            await _opnetPrividerPrivate._bcm.request({
                method: 'tabCheckin',
                params: { icon, name, origin }
            });

            // Do not force to tabCheckin
            // this._requestPromise.check(2);
        });

        try {
            const { network, chain, accounts, isUnlocked }: ProviderState = await this._request({
                method: 'getProviderState'
            }) as ProviderState;

            if (isUnlocked) {
                _opnetPrividerPrivate._isUnlocked = true;
                _opnetPrividerPrivate._state.isUnlocked = true;
            }
            this.emit('connect', {});
            _opnetPrividerPrivate._pushEventHandlers?.networkChanged({
                network,
                chain
            });

            _opnetPrividerPrivate._pushEventHandlers?.accountsChanged(accounts);
        } catch {
            //
        } finally {
            _opnetPrividerPrivate._initialized = true;
            _opnetPrividerPrivate._state.initialized = true;
            this.emit('_initialized');
        }

        void this.keepAlive();
    };

    _request = async (data: RequestParams) => {
        if (!data) {
            throw rpcErrors.invalidRequest();
        }

        this._requestPromiseCheckVisibility();

        return _opnetPrividerPrivate._requestPromise
            .call(async () => {
                log('[request]', JSON.stringify(data, null, 2));

                const res = await _opnetPrividerPrivate._bcm.request(data).catch((err) => {
                    // TODO (typing): Check if sending error without serialization cause any issues on the dApp side.
                    log('[request: error]', data.method, err);
                    throw err;
                });

                log('[request: success]', data.method, res);

                return res;
            })
            .catch((err: unknown) => {
                console.log(err);
                throw err;
            });
    };

    // public methods
    requestAccounts = async () => {
        return this._request({
            method: 'requestAccounts'
        });
    };
    // TODO: support multi request!
    // request = async (data) => {
    //   return this._request(data);
    // };

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
                sendBitcoinParams: {
                    toAddress,
                    satoshis,
                    feeRate: options?.feeRate,
                    memo: options?.memo,
                    memos: options?.memos
                },
                type: TxType.SEND_BITCOIN
            }
        })) as Promise<string>;
    };

    deployContract = async (params: IDeploymentParametersWithoutSigner): Promise<DeploymentResult> => {
        return (await this._request({
            method: 'deployContract',
            params: params
        })) as Promise<DeploymentResult>;
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

    signPsbt = async (psbtHex: string, options?: SignPsbtOptions) => {
        return this._request({
            method: 'signPsbt',
            params: {
                psbtHex,
                type: TxType.SIGN_TX,
                options
            }
        });
    };

    signPsbts = async (psbtHexs: string[], options?: SignPsbtOptions[]) => {
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

    getVersion = async () => {
        return this._request({
            method: 'getVersion'
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

    private _requestPromiseCheckVisibility = () => {
        if (document.visibilityState === 'visible') {
            _opnetPrividerPrivate._requestPromise.check(1);
        } else {
            _opnetPrividerPrivate._requestPromise.uncheck(1);
        }
    };

    private _handleBackgroundMessage = (params: { event: string; data: unknown }) => {
        log('[push event]', params.event, params.data);

        // @ts-ignore
        if (_opnetPrividerPrivate._pushEventHandlers?.[params.event]) {
            // @ts-ignore
            return _opnetPrividerPrivate._pushEventHandlers[params.event](params.data);
        }

        this.emit(params.event, params.data);
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
            log('[keepAlive: error]', e);
        }

        setTimeout(async () => {
            await this.keepAlive();
        }, 1000);
    };
}

const provider = new OpnetProvider();

// Allow website that support unisat to support OP_NET.
setTimeout(() => {
    if (!window.unisat) {
        window.unisat = new Proxy(provider, {
            deleteProperty: () => true
        }) as unknown as Unisat;

        Object.defineProperty(window, 'unisat', {
            value: new Proxy(provider, {
                deleteProperty: () => true
            }),
            writable: true
        });

        window.dispatchEvent(new Event('unisat#initialized'));
    }
}, 2000);

// force opnet.

window.opnet = new Proxy(provider, {
    deleteProperty: () => true
}) as unknown as Unisat;

Object.defineProperty(window, 'opnet', {
    value: new Proxy(provider, {
        deleteProperty: () => true
    }),
    writable: false
});

window.dispatchEvent(new Event('opnet#initialized'));
