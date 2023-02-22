import { createPersistStore } from '@/background/utils';
import { INITIAL_OPENAPI_URL } from '@/shared/constant';
import { AppSummary, BitcoinBalance, Inscription, InscriptionSummary, TxHistoryItem, UTXO } from '@/shared/types';

interface OpenApiStore {
  host: string;
  config?: any;
}

const maxRPS = 100;

enum API_STATUS {
  FAILED = '0',
  SUCCESS = '1'
}

const prefix = '/api/v1';
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
        host: INITIAL_OPENAPI_URL
      }
    });

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
    let url = INITIAL_OPENAPI_URL + route;
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
    const url = INITIAL_OPENAPI_URL + route;
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
    const data = await this.httpGet(prefix + '/wallet/config', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressBalance(address: string): Promise<BitcoinBalance> {
    const data = await this.httpGet(prefix + '/address/balance', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressUtxo(address: string): Promise<UTXO[]> {
    const data = await this.httpGet(prefix + '/address/utxo', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressInscriptions(address: string): Promise<Inscription[]> {
    const data = await this.httpGet(prefix + '/address/inscriptions', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAddressRecentHistory(address: string): Promise<TxHistoryItem[]> {
    const data = await this.httpGet(prefix + '/address/recent-history', {
      address
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getInscriptionSummary(): Promise<InscriptionSummary> {
    const data = await this.httpGet(prefix + '/inscription-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async getAppSummary(): Promise<AppSummary> {
    const data = await this.httpGet(prefix + '/app-summary', {});
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }

  async pushTx(rawtx: string): Promise<string> {
    const data = await this.httpPost(prefix + '/tx/broadcast', {
      rawtx
    });
    if (data.status == API_STATUS.FAILED) {
      throw new Error(data.message);
    }
    return data.result;
  }
}

export default new OpenApiService();
