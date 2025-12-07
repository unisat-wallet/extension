/**
 * Bitcoin API methods
 * Handles Bitcoin-related functionality
 */
import {
  RequestMethodGetBitcoinUtxosParams,
  RequestMethodGetInscriptionsParams,
  RequestMethodInscribeTransferParams,
  RequestMethodSendBitcoinParams,
  RequestMethodSendInscriptionParams,
  RequestMethodSendRunesParams,
  RequestMethodSignMessageParams,
  RequestMethodSignMessagesParams,
  TxType
} from '@/shared/types';

import { requestMethodKey } from './providerState';

export class BitcoinAPIMethods {
  constructor(private provider: any) {}

  requestAccounts = async () => {
    return this.provider[requestMethodKey]({
      method: 'requestAccounts'
    });
  };

  disconnect = async () => {
    return this.provider[requestMethodKey]({
      method: 'disconnect'
    });
  };

  getNetwork = async () => {
    return this.provider[requestMethodKey]({
      method: 'getNetwork'
    });
  };

  switchNetwork = async (network: string) => {
    return this.provider[requestMethodKey]({
      method: 'switchNetwork',
      params: {
        network
      }
    });
  };

  getChain = async () => {
    return this.provider[requestMethodKey]({
      method: 'getChain'
    });
  };

  switchChain = async (chain: string) => {
    return this.provider[requestMethodKey]({
      method: 'switchChain',
      params: {
        chain
      }
    });
  };

  getAccounts = async () => {
    return this.provider[requestMethodKey]({
      method: 'getAccounts'
    });
  };

  getPublicKey = async () => {
    return this.provider[requestMethodKey]({
      method: 'getPublicKey'
    });
  };

  // deprecated
  getBalance = async () => {
    return this.provider[requestMethodKey]({
      method: 'getBalance'
    });
  };

  getBalanceV2 = async () => {
    return this.provider[requestMethodKey]({
      method: 'getBalanceV2'
    });
  };

  getInscriptions = async (cursor = 0, size = 20) => {
    const params: RequestMethodGetInscriptionsParams = {
      cursor,
      size
    };
    return this.provider[requestMethodKey]({
      method: 'getInscriptions',
      params
    });
  };

  signMessage = async (text: string, type: string) => {
    const params: RequestMethodSignMessageParams = {
      text,
      type
    };
    return this.provider[requestMethodKey]({
      method: 'signMessage',
      params
    });
  };

  multiSignMessage = async (messages: { text: string; type: string }[]) => {
    const params: RequestMethodSignMessagesParams = {
      messages
    };
    return this.provider[requestMethodKey]({
      method: 'multiSignMessage',
      params
    });
  };

  verifyMessageOfBIP322Simple = async (address: string, message: string, signature: string, network?: number) => {
    return this.provider[requestMethodKey]({
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
    return this.provider[requestMethodKey]({
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
    const params: RequestMethodSendBitcoinParams = {
      sendBitcoinParams: {
        toAddress,
        satoshis,
        feeRate: options?.feeRate,
        memo: options?.memo,
        memos: options?.memos
      },
      type: TxType.SEND_BITCOIN
    };
    return this.provider[requestMethodKey]({
      method: 'sendBitcoin',
      params
    });
  };

  sendInscription = async (toAddress: string, inscriptionId: string, options?: { feeRate: number }) => {
    const params: RequestMethodSendInscriptionParams = {
      sendInscriptionParams: {
        toAddress,
        inscriptionId,
        feeRate: options?.feeRate
      },
      type: TxType.SEND_ORDINALS_INSCRIPTION
    };
    return this.provider[requestMethodKey]({
      method: 'sendInscription',
      params
    });
  };

  sendRunes = async (toAddress: string, runeid: string, amount: string, options?: { feeRate: number }) => {
    const params: RequestMethodSendRunesParams = {
      sendRunesParams: {
        toAddress,
        runeid,
        amount,
        feeRate: options?.feeRate
      },
      type: TxType.SEND_RUNES
    };
    return this.provider[requestMethodKey]({
      method: 'sendRunes',
      params
    });
  };

  pushTx = async (rawtx: string) => {
    return this.provider[requestMethodKey]({
      method: 'pushTx',
      params: {
        rawtx
      }
    });
  };

  signPsbt = async (psbtHex: string, options?: any) => {
    return this.provider[requestMethodKey]({
      method: 'signPsbt',
      params: {
        psbtHex,
        type: TxType.SIGN_TX,
        options
      }
    });
  };

  signPsbts = async (psbtHexs: string[], options?: any[]) => {
    return this.provider[requestMethodKey]({
      method: 'multiSignPsbt',
      params: {
        psbtHexs,
        options
      }
    });
  };

  pushPsbt = async (psbtHex: string) => {
    return this.provider[requestMethodKey]({
      method: 'pushPsbt',
      params: {
        psbtHex
      }
    });
  };

  inscribeTransfer = async (ticker: string, amount: string) => {
    const params: RequestMethodInscribeTransferParams = {
      ticker,
      amount
    };

    return this.provider[requestMethodKey]({
      method: 'inscribeTransfer',
      params
    });
  };

  getVersion = async () => {
    return this.provider[requestMethodKey]({
      method: 'getVersion'
    });
  };

  getBitcoinUtxos = async (cursor = 0, size = 20) => {
    const params: RequestMethodGetBitcoinUtxosParams = {
      cursor,
      size
    };
    return this.provider[requestMethodKey]({
      method: 'getBitcoinUtxos',
      params
    });
  };
}
