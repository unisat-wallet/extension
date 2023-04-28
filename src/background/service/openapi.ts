import { createPersistStore } from '@/background/utils';
import { OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET } from '@/shared/constant';
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
  DecodedPsbt
} from '@/shared/types';

interface OpenApiStore {
  host: string;
  config?: any;
}

const maxRPS = 100;

enum API_STATUS {
  FAILED = '0',
  SUCCESS = '1'
}

export class OpenApiService {
  store!: OpenApiStore;
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
        host: OPENAPI_URL_MAINNET
      }
    });

    if ([OPENAPI_URL_MAINNET, OPENAPI_URL_TESTNET].includes(this.store.host) === false) {
      this.store.host = OPENAPI_URL_MAINNET;
    }

    const getConfig = async () => {
      try {
        this.store.config = await this.getWalletConfig();
      } catch (e) {
        setTimeout(() => {
          getConfig(); // reload openapi config if load failed 5s later
        }, 5000);
      }
    };
    getConfig();
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
    headers.append('X-Version', process.env.release!);
    const res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    const data = await res.json();
    return data;
  };

  httpPost = async (route: string, params: any) => {
    const url = this.getHost() + route;
    const headers = new Headers();
    headers.append('X-Client', 'UniSat Wallet');
    headers.append('X-Version', process.env.release!);
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

  async getWalletConfig(): Promise<any> {
    const data = await this.httpGet('/v1/wallet/config', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressBalance(address: string): Promise<BitcoinBalance> {
    const data = await this.httpGet('/v2/address/balance', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getMultiAddressAssets(addresses: string): Promise<AddressAssets[]> {
    const data = await this.httpGet('/v3/address/multi-assets', {
      addresses
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressUtxo(address: string): Promise<UTXO[]> {
    const data = await this.httpGet('/v3/address/btc-utxo', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionUtxo(inscriptionId: string): Promise<UTXO> {
    const data = await this.httpGet('/v3/inscription/utxo', {
      inscriptionId
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionUtxos(inscriptionIds: string[]): Promise<UTXO[]> {
    const data = await this.httpPost('/v3/inscription/utxos', {
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
    const data = await this.httpGet('/v3/address/inscriptions', {
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
    const data = await this.httpGet('/v1/address/recent-history', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionSummary(): Promise<InscriptionSummary> {
    const data = await this.httpGet('/v3/inscription-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAppSummary(): Promise<AppSummary> {
    const data = await this.httpGet('/v1/app-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async pushTx(rawtx: string): Promise<string> {
    const data = await this.httpPost('/v3/tx/broadcast', {
      rawtx
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getFeeSummary(): Promise<FeeSummary> {
    const data = await this.httpGet('/v1/fee-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getDomainInfo(domain: string): Promise<Inscription> {
    const data = await this.httpGet('/v3/address/search', { domain });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async inscribeBRC20Transfer(address: string, tick: string, amount: string, feeRate: number): Promise<InscribeOrder> {
    const data = await this.httpPost('/v3/brc20/inscribe-transfer', { address, tick, amount, feeRate });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscribeResult(orderId: string): Promise<TokenTransfer> {
    const data = await this.httpGet('/v3/brc20/order-result', { orderId });
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
    const data = await this.httpGet('/v3/brc20/tokens', { address, cursor, size });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressTokenSummary(address: string, ticker: string): Promise<AddressTokenSummary> {
    const data = await this.httpGet('/v3/brc20/token-summary', { address, ticker: encodeURIComponent(ticker) });
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
    const data = await this.httpGet('/v3/brc20/transferable-list', {
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
    const data = await this.httpPost('/v3/tx/decode', { psbtHex });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }
}

export default new OpenApiService();
