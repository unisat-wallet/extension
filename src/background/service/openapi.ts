import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { CHANNEL, OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET, VERSION } from '@/shared/constant';
import {
  AddressAssets,
  AppSummary,
  TokenBalance,
  BitcoinBalance,
  FeeSummary,
  InscribeOrder,
  Inscription,
  InscriptionSummary,
  TxHistoryItem,
  UTXO,
  TokenTransfer,
  AddressTokenSummary,
  DecodedPsbt,
  WalletConfig,
  UTXO_Detail
} from '@/shared/types';

interface OpenApiStore {
  host: string;
  deviceId: string;
  config?: WalletConfig;
}

const maxRPS = 100;

enum API_STATUS {
  FAILED = '0',
  SUCCESS = '1'
}

export class OpenApiService {
  store!: OpenApiStore;
  clientAddress = '';
  setHost = async (host: string) => {
    this.store.host = host;
    await this.init();
  };

  getHost = () => {
    return this.store.host;
  };

  init = async () => {
    this.store = await createPersistStore({
      name: 'openapi',
      template: {
        host: OPENAPI_URL_MAINNET,
        deviceId: randomstring.generate(12)
      }
    });

    if ([OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET].includes(this.store.host) === false) {
      this.store.host = OPENAPI_URL_MAINNET;
    }

    if (!this.store.deviceId) {
      this.store.deviceId = randomstring.generate(12);
    }

    const getConfig = async () => {
      try {
        this.store.config = await this.getWalletConfig();
      } catch (e) {
        this.store.config = {
          version: '0.0.0',
          moonPayEnabled: true,
          statusMessage: (e as any).message
        };
      }
    };
    getConfig();
  };

  setClientAddress = async (token: string) => {
    this.clientAddress = token;
  };

  httpGet = async (route: string, params: any) => {
    let url = this.getHost() + route;
    let c = 0;
    for (const id in params) {
      if (c == 0) {
        url += '?';
      } else {
        url += '&';
      }
      url += `${id}=${params[id]}`;
      c++;
    }
    const headers = new Headers();
    headers.append('X-Client', 'UniSat Wallet');
    headers.append('X-Version', VERSION);
    headers.append('x-address', this.clientAddress);
    headers.append('x-channel', CHANNEL);
    headers.append('x-udid', this.store.deviceId);
    const res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    const data = await res.json();
    return data;
  };

  httpPost = async (route: string, params: any) => {
    const url = this.getHost() + route;
    const headers = new Headers();
    headers.append('X-Client', 'UniSat Wallet');
    headers.append('X-Version', VERSION);
    headers.append('x-address', this.clientAddress);
    headers.append('x-channel', CHANNEL);
    headers.append('x-udid', this.store.deviceId);
    headers.append('Content-Type', 'application/json;charset=utf-8');
    const res = await fetch(new Request(url), {
      method: 'POST',
      headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  };

  async getWalletConfig(): Promise<WalletConfig> {
    const data = await this.httpGet('/default/config', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressBalance(address: string): Promise<BitcoinBalance> {
    const data = await this.httpGet('/address/balance', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getMultiAddressAssets(addresses: string): Promise<AddressAssets[]> {
    const data = await this.httpGet('/address/multi-assets', {
      addresses
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async findGroupAssets(
    groups: { type: number; address_arr: string[] }[]
  ): Promise<{ type: number; address_arr: string[]; satoshis_arr: number[] }[]> {
    const data = await this.httpPost('/address/find-group-assets', {
      groups
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressUtxo(address: string): Promise<UTXO[]> {
    const data = await this.httpGet('/address/btc-utxo', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionUtxo(inscriptionId: string): Promise<UTXO> {
    const data = await this.httpGet('/inscription/utxo', {
      inscriptionId
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionUtxoDetail(inscriptionId: string): Promise<UTXO_Detail> {
    const data = await this.httpGet('/inscription/utxo-detail', {
      inscriptionId
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionUtxos(inscriptionIds: string[]): Promise<UTXO[]> {
    const data = await this.httpPost('/inscription/utxos', {
      inscriptionIds
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressInscriptions(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: Inscription[]; total: number }> {
    const data = await this.httpGet('/address/inscriptions', {
      address,
      cursor,
      size
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressRecentHistory(address: string): Promise<TxHistoryItem[]> {
    const data = await this.httpGet('/address/recent-history', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionSummary(): Promise<InscriptionSummary> {
    const data = await this.httpGet('/default/inscription-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAppSummary(): Promise<AppSummary> {
    const data = await this.httpGet('/default/app-summary-v2', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async pushTx(rawtx: string): Promise<string> {
    const data = await this.httpPost('/tx/broadcast', {
      rawtx
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getFeeSummary(): Promise<FeeSummary> {
    const data = await this.httpGet('/default/fee-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getDomainInfo(domain: string): Promise<Inscription> {
    const data = await this.httpGet('/address/search', { domain });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async inscribeBRC20Transfer(address: string, tick: string, amount: string, feeRate: number): Promise<InscribeOrder> {
    const data = await this.httpPost('/brc20/inscribe-transfer', { address, tick, amount, feeRate });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscribeResult(orderId: string): Promise<TokenTransfer> {
    const data = await this.httpGet('/brc20/order-result', { orderId });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressTokenBalances(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenBalance[]; total: number }> {
    const data = await this.httpGet('/brc20/tokens', { address, cursor, size });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressTokenSummary(address: string, ticker: string): Promise<AddressTokenSummary> {
    const data = await this.httpGet('/brc20/token-summary', { address, ticker: encodeURIComponent(ticker) });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getTokenTransferableList(
    address: string,
    ticker: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenTransfer[]; total: number }> {
    const data = await this.httpGet('/brc20/transferable-list', {
      address,
      ticker: encodeURIComponent(ticker),
      cursor,
      size
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async decodePsbt(psbtHex: string): Promise<DecodedPsbt> {
    const data = await this.httpPost('/tx/decode', { psbtHex });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async createMoonpayUrl(address: string): Promise<string> {
    const data = await this.httpPost('/moonpay/create', { address });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async checkWebsite(website: string): Promise<{ isScammer: boolean }> {
    const data = await this.httpPost('/default/check-website', { website });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }
}

export default new OpenApiService();
