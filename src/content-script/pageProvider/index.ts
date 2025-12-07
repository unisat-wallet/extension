// this script is injected into webpage's context
import { EventEmitter } from 'events';

import PushEventHandlers from './pushEventHandlers';
import { BitcoinAPIMethods } from './bitcoinAPI';
import { CosmosAPIMethods } from './cosmosAPI';
import {
  initializeProvider,
  requestMethod,
  requestPromiseCheckVisibility
} from './providerCore';
import { createProviderProxy, injectProviderToWindow } from './providerInjection';
import { _unisatProviderPrivate, requestMethodKey } from './providerState';
import { Interceptor } from './types';

export { Interceptor };

export class UnisatProvider extends EventEmitter {
  private bitcoinAPI: BitcoinAPIMethods;
  public keplr: CosmosAPIMethods;

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);

    // Initialize API modules
    this.bitcoinAPI = new BitcoinAPIMethods(this);
    this.keplr = new CosmosAPIMethods(this);

    // Setup push event handlers
    _unisatProviderPrivate._pushEventHandlers = new PushEventHandlers(this, _unisatProviderPrivate);

    // Initialize provider
    this.initialize();
  }

  private initialize = async () => {
    await initializeProvider(this);
  };

  // Implement truly private request method using Symbol
  private [requestMethodKey] = async (data) => {
    return requestMethod(data);
  };

  // Keep _request method as a compatibility layer, but show warning
  _request = async (data) => {
    console.warn(
      '[UniSat] Directly accessing _request method is deprecated and will be removed in future versions. Please use the public API instead.'
    );
    return this[requestMethodKey](data);
  };

  // Bitcoin API methods - delegate to BitcoinAPIMethods
  requestAccounts = async () => this.bitcoinAPI.requestAccounts();
  disconnect = async () => this.bitcoinAPI.disconnect();
  getNetwork = async () => this.bitcoinAPI.getNetwork();
  switchNetwork = async (network: string) => this.bitcoinAPI.switchNetwork(network);
  getChain = async () => this.bitcoinAPI.getChain();
  switchChain = async (chain: string) => this.bitcoinAPI.switchChain(chain);
  getAccounts = async () => this.bitcoinAPI.getAccounts();
  getPublicKey = async () => this.bitcoinAPI.getPublicKey();
  getBalance = async () => this.bitcoinAPI.getBalance();
  getBalanceV2 = async () => this.bitcoinAPI.getBalanceV2();
  getInscriptions = async (cursor = 0, size = 20) => this.bitcoinAPI.getInscriptions(cursor, size);
  signMessage = async (text: string, type: string) => this.bitcoinAPI.signMessage(text, type);
  multiSignMessage = async (messages: { text: string; type: string }[]) => this.bitcoinAPI.multiSignMessage(messages);
  verifyMessageOfBIP322Simple = async (address: string, message: string, signature: string, network?: number) =>
    this.bitcoinAPI.verifyMessageOfBIP322Simple(address, message, signature, network);
  signData = async (data: string, type: string) => this.bitcoinAPI.signData(data, type);
  sendBitcoin = async (
    toAddress: string,
    satoshis: number,
    options?: { feeRate: number; memo?: string; memos?: string[] }
  ) => this.bitcoinAPI.sendBitcoin(toAddress, satoshis, options);
  sendInscription = async (toAddress: string, inscriptionId: string, options?: { feeRate: number }) =>
    this.bitcoinAPI.sendInscription(toAddress, inscriptionId, options);
  sendRunes = async (toAddress: string, runeid: string, amount: string, options?: { feeRate: number }) =>
    this.bitcoinAPI.sendRunes(toAddress, runeid, amount, options);
  pushTx = async (rawtx: string) => this.bitcoinAPI.pushTx(rawtx);
  signPsbt = async (psbtHex: string, options?: any) => this.bitcoinAPI.signPsbt(psbtHex, options);
  signPsbts = async (psbtHexs: string[], options?: any[]) => this.bitcoinAPI.signPsbts(psbtHexs, options);
  pushPsbt = async (psbtHex: string) => this.bitcoinAPI.pushPsbt(psbtHex);
  inscribeTransfer = async (ticker: string, amount: string) => this.bitcoinAPI.inscribeTransfer(ticker, amount);
  getVersion = async () => this.bitcoinAPI.getVersion();
  getBitcoinUtxos = async (cursor = 0, size = 20) => this.bitcoinAPI.getBitcoinUtxos(cursor, size);
}

declare global {
  interface Window {
    unisat: UnisatProvider;
  }
}

// Create and inject provider
const provider = new UnisatProvider();
const providerProxy = createProviderProxy(provider, requestMethodKey);
injectProviderToWindow(providerProxy);
