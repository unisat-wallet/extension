import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { ORCAPI_URL_MAINNET, ORCAPI_URL_TESTNET, ORCCASHAPI_URL_MAINNET, ORCCASHAPI_URL_TESTNET } from '@/shared/constant';
import {
  AddressTokenSummary, InscribeOrder, TokenBalance, TokenTransfer,
} from '@/shared/types';

interface OrcApiStore {
  host: string;
}

export class OrcApiService {
  store!: OrcApiStore;
  clientAddress = '';
  prototol = 'orc-20';
  constructor(p: 'orc-20' | 'orc-cash' | undefined) {
    if(p) this.prototol = p;
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
      name: this.prototol === 'orc-cash' ? 'orc-cash-api' : 'orc-20-api',
      template: {
        host: this.prototol === 'orc-cash' ? ORCCASHAPI_URL_MAINNET : ORCAPI_URL_MAINNET,
        deviceId: randomstring.generate(12)
      }
    });
    if (this.prototol === 'orc-cash') {
      if ([ORCCASHAPI_URL_MAINNET, ORCCASHAPI_URL_TESTNET].includes(this.store.host) === false) {
        this.store.host = ORCCASHAPI_URL_MAINNET;
      }
    } else {
      if ([ORCAPI_URL_MAINNET, ORCAPI_URL_TESTNET].includes(this.store.host) === false) {
        this.store.host = ORCAPI_URL_MAINNET;
      }
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
    const data = await this.httpGet('/orc20/holder-inscribes', { address, inscriptionNumber, pageNo: 1, pageSize: 100 });
    const tokenData = await this.httpGet('/orc20/user-token-balances', { address, inscriptionNumber, pageNo: 1, pageSize: 1});
    console.log(data, tokenData)
    if (data.code !== '000' || tokenData.code !== '000') {
      throw new Error(data.msg || tokenData.msg);
    }
    const result = data.data
    const token = tokenData.data.items[0]
    return {
      tokenInfo: {
        totalMinted: '',
        totalSupply: '2100000'
      },
      tokenBalance: {
        tokenID: token.userTokenBalanceOrc20ID,
        availableBalance: token.userTokenBalanceAvailable,
        ticker: token.userTokenBalanceTicker,
        transferableBalance: token.userTokenBalanceTransferableBalance,
        overallBalance: token.userTokenBalanceBalance,
        availableBalanceSafe: '',
        availableBalanceUnSafe: ''
      },
      historyList: [],
      transferableList: result.items.map((item: any) => ({
        ticker: item.operationHistoryTicker,
        amount: item.operationHistoryAmount,
        inscriptionId: item.operationHistoryInscriptionID,
        inscriptionNumber: item.operationHistoryNumber,
        timestamp: item.operationHistoryBlockTime,
        type: item.operationHistoryType
      }))
    }
  }
  async getTokenTransferableList(
    address: string,
    inscriptionNumber: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenTransfer[]; total: number }> {
    const pageNo =  Math.floor(cursor / size) + 1;
    const data = await this.httpGet('/orc20/holder-inscribes', {
      address,
      inscriptionNumber,
      pageNo,
      pageSize: size
    });
    if (data.code !== '000') {
      throw new Error(data.msg);
    }
    return {
      total: data.data.totalCount,
      list :data.data.items.map((item) => ({
        ticker: item.operationHistoryTicker,
        amount: item.operationHistoryAmount,
        inscriptionId: item.operationHistoryInscriptionID,
        inscriptionNumber: item.operationHistoryNumber,
        timestamp: item.operationHistoryBlockTime,
        type: item.operationHistoryType
      }))}
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
          tokenID: item.userTokenBalanceOrc20ID,
          inscriptionNumber: item.userTokenBalanceInscriptionNumber,
          availableBalance: Number(item.userTokenBalanceAvailable),
          ticker: item.userTokenBalanceTicker,
          transferableBalance: Number(item.userTokenBalanceTransferableBalance),
          overallBalance: Number(item.userTokenBalanceBalance)
        }
      ))
    }
  }

  async inscribeORC20Send(address: string, tick: string, tokenID: string, amount: string, feeRate: number, protocol: string): Promise<InscribeOrder> {
    const contentList = this.generateMintDataForOrder(tick, tokenID, amount, protocol)
    console.log({ contentList });
    const order = {
      receiveAddress: address,
      feeRate,
      contentList,
      satsInInscription: 546
    }
    console.log({ order });
    const dataSize = await this.httpPost('/inscribe/dataSize', { data: contentList})
    const result = await this.httpPost('/inscribe/order', order);
    if (result.code !== '000') {
      throw new Error(result.msg);
    }
    if (dataSize.code !== '000') {
      throw new Error(dataSize.msg);
    }
    const minerFee =  Math.floor(dataSize.data * feeRate * 1.05)
    const serviceFee = 1999
    return {
      orderId: result.data.orderId,
      payAddress: result.data.orderPayAddress,
      totalFee: minerFee + serviceFee + 546,
      minerFee,
      originServiceFee: serviceFee,
      serviceFee,
      outputValue: 546
    }
  }

  async getInscribeResult(orderId: string): Promise<TokenTransfer> {
    const result = await this.httpGet('/inscribe/orderList', { orderids: [orderId] });
    if (result.code !== '000') {
      throw new Error(result.msg);
    }
    return result.data[0];
  }

  private generateMintDataForOrder (tick: string, tokenID: string, amount: string, protocol: string) {
    const inscription: { [key: string]: string | undefined } = {
      p: protocol,
      op: 'send',
      tick,
      id: tokenID,
      amt: amount
    }
    return [JSON.stringify(inscription)]
  }
}

export const orcapiService =  new OrcApiService('orc-20');
export const orccashapiService =  new OrcApiService('orc-cash');
