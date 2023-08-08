import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { ORCAPI_URL_MAINNET, ORCAPI_URL_TESTNET, ORCCASHAPI_URL_MAINNET } from '@/shared/constant';
import {
  AddressTokenSummary, TokenBalance,
} from '@/shared/types';

interface OrcApiStore {
  host: string;
}

export class OrcApiService {
  store!: OrcApiStore;
  clientAddress = '';
  isOrcCash = false;
  constructor(isOrcCash: boolean) {
    this.isOrcCash = isOrcCash;
  }
  setHost = async (host: string) => {
    this.store.host = host;
    await this.init();
  };

  getHost = () => {
    return this.store.host;
  };

  init = async () => {
    this.store = await createPersistStore({
      name: 'orcapi',
      template: {
        host: this.isOrcCash ? ORCCASHAPI_URL_MAINNET : ORCAPI_URL_MAINNET,
        deviceId: randomstring.generate(12)
      }
    });
    if ([ORCAPI_URL_MAINNET, ORCAPI_URL_TESTNET].includes(this.store.host) === false) {
      this.store.host = ORCAPI_URL_MAINNET;
    }
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
    const res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    const data = await res.json();
    return data;
  };

  httpPost = async (route: string, params: any) => {
    const url = this.getHost() + route;
    const headers = new Headers();
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

  async getAddressTokenSummary(address: string, inscriptionNumber?: string): Promise<AddressTokenSummary> {
    const data = await this.httpGet('/orc20/user-token-balances', { address, inscriptionNumber, pageNo: 1, pageSize: 100 });
    if (data.status !== '000') {
      throw new Error(data.message);
    }
    const result = data.result
    console.log(result);
  }
  async getAddressTokenBalances
  (
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenBalance[]; total: number }> {
    const pageNo =  Math.floor(cursor / size) + 1;
    const data = await this.httpGet('/orc20/user-token-balances', { address, pageNo, pageSize: size, sort: 'balance,desc'});
    if (data.code !== '000') {
      throw new Error(data.message);
    }
    const result = data.data
    const total = Number(result.totalCount);
    return {
      total,
      list: result.items.map((item: any) => (
        {
          availableBalance: Number(item.userTokenBalanceAvailable),
          ticker: item.userTokenBalanceTicker,
          transferableBalance: Number(item.userTokenBalanceTransferableBalance),
          overallBalance: Number(item.userTokenBalanceBalance)
        }
      ))
    }
  }
}

export const orcapiService =  new OrcApiService(false);
export const orccashapiService =  new OrcApiService(true);
