/**
 * Cosmos/Keplr API methods
 * Handles Cosmos blockchain integration
 */
import { objToUint8Array } from '@/shared/utils';
import { CosmosChainInfo } from '@unisat/babylon-service';

import { requestMethodKey } from './providerState';

export class CosmosAPIMethods {
  constructor(private provider: any) {}

  enable = async (chainId: string) => {
    return this.provider[requestMethodKey]({
      method: 'cosmos_enable',
      params: {
        chainId
      }
    });
  };

  experimentalSuggestChain = async (chainData: CosmosChainInfo) => {
    return this.provider[requestMethodKey]({
      method: 'cosmos_experimentalSuggestChain',
      params: {
        chainData
      }
    });
  };

  getKey = async (chainId: string) => {
    const _key: any = await this.provider[requestMethodKey]({
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
  };

  getOfflineSigner = (chainId: string, signOptions?: any) => {
    return new CosmJSOfflineSigner(chainId, this.provider, signOptions);
  };

  signArbitrary = async (chainId: string, signerAddress: string, data: string | Uint8Array) => {
    return this.provider[requestMethodKey]({
      method: 'cosmos_signArbitrary',
      params: {
        chainId,
        signerAddress,
        type: typeof data === 'string' ? 'string' : 'Uint8Array',
        data: typeof data === 'string' ? data : Buffer.from(data).toString('base64'),
        origin: window.location.origin
      }
    });
  };
}

export class CosmJSOfflineSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly provider: any,
    protected readonly signOptions?: any
  ) {}

  async getAccounts() {
    const cosmosAPI = new CosmosAPIMethods(this.provider);
    const key: any = await cosmosAPI.getKey(this.chainId);
    return [
      {
        address: key.bech32Address,
        algo: key.algo,
        pubkey: key.pubKey
      }
    ];
  }

  async signDirect(signerAddress: string, signDoc: any) {
    const response: any = await this.provider[requestMethodKey]({
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
