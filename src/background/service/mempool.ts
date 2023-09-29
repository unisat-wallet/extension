import { MEMPOOL_URL } from '@/shared/constant';

export class MempoolService {
  constructor(public host: string = MEMPOOL_URL) {}
  public getHost() {
    return this.host;
  }

  public setHost(host: string) {
    this.host = host;
  }

  async getFee() {
    return this.httpGet('/api/v1/fees/recommended', {});
  }

  async getPrice() {
    return this.httpGet('/api/v1/historical-price', { timestamp: Date.now() });
  }

  async getUtxo(address: string) {
    return this.httpGet(`/api/address/${address}/utxo`, {});
  }

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
    headers.append('X-Client', 'ATOM Wallet');
    const res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    console.log({ res });
    const data = await res.json();
    return data;
  };
}

export const mempoolService = new MempoolService(MEMPOOL_URL);
