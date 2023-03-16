import { createPersistStore } from '@/background/utils';

interface DomainApiStore {
  host: string;
}

export interface DomainInfo {
  domain: string;
  receive_address: string;
}

export const BTC_DOMAIN_API_MAINNET = 'https://btcdomains.io';
export const BTC_DOMAIN_API_TESTNET = 'http://137.184.180.14';

export enum API_STATUS {
  ILLEGAL = '316',
  NOTFOUND = '317',
  FAILED = '',
  SUCCESS = '0'
}

export class DomainService {
  store!: DomainApiStore;

  constructor() {
    createPersistStore({
      name: 'domainapi',
      template: {
        host: BTC_DOMAIN_API_MAINNET
      }
    }).then((val) => {
      this.store = val;

      if ([BTC_DOMAIN_API_MAINNET, BTC_DOMAIN_API_TESTNET].includes(this.store.host) === false) {
        this.store.host = BTC_DOMAIN_API_MAINNET;
      }
    });
  }

  setHost = async (host: string) => {
    this.store.host = host;
  };

  getHost = () => {
    return this.store.host;
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

  async queryDomain(domain: string): Promise<DomainInfo> {
    const data = await this.httpPost('/api/resolveDomain', {
      domain: domain
    });

    if (data.code != API_STATUS.SUCCESS) {
      throw new Error(data.message, { cause: data.code });
    }

    return data.data;
  }
}

export default new DomainService();
