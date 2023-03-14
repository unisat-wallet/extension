import { createPersistStore } from '@/background/utils';

interface DomainApiStore {
  host: string;
}

export interface DomainInfo {
  cost_fee: string;
  create_time: string;
  dom_name: string;
  dom_state: number;
  dom_type: string;
  expire_time: string;
  fee_rate: number;
  img_url: string;
  inscribe_id: string;
  out_wallet: string;
  owner_address: string;
  tx_hash: string;
  update_time: string;
  wallet_id: string;
}

export const BTC_DOMAIN_API_MAINNET = 'https://btcdomains.io';
export const BTC_DOMAIN_API_TESTNET = 'http://137.184.180.14:80';

enum API_STATUS {
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
      this.store = val

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
    const data = await this.httpPost('/api/queryDomain', {
      'domain': domain
    });

    if (data.code != API_STATUS.SUCCESS) {
      throw new Error(data.message);
    }
    return data.data;
  }
}

export default new DomainService();