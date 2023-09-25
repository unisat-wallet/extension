import { UTXO } from './utxo';

export interface IUnspentResponse {
  confirmed: number;
  unconfirmed: number;
  balance: number;
  utxos: UTXO[];
}

export interface ElectrumApiInterface {
  close: () => Promise<void>;
  open: () => Promise<void | boolean>;
  getUrl: () => string;
  resetConnection: () => Promise<void>;
  isOpen: () => boolean;
  sendTransaction: (rawtx: string) => Promise<string>;
  getUnspentAddress: (address: string) => Promise<IUnspentResponse>;
  getUnspentScripthash: (address: string) => Promise<IUnspentResponse>;
  waitUntilUTXO: (address: string, satoshis: number, sleepTimeSec: number, exactSatoshiAmount?: boolean) => Promise<any>;
  getTx: (txid: string, verbose?: boolean) => Promise<any>;
  serverVersion: () => Promise<any>;
  broadcast: (rawtx: string) => Promise<any>;
  history: (scripthash: string) => Promise<any>;
  // Atomicals API
  atomicalsGetGlobal: () => Promise<any>;
  atomicalsGet: (atomicalAliasOrId: string | number) => Promise<any>;
  atomicalsGetLocation: (atomicalAliasOrId: string | number) => Promise<any>;
  atomicalsGetState: (atomicalAliasOrId: string | number, path: string, verbose: boolean) => Promise<any>;
  atomicalsGetStateHistory: (atomicalAliasOrId: string | number) => Promise<any>;
  atomicalsGetEventHistory: (atomicalAliasOrId: string | number) => Promise<any>;
  atomicalsGetTxHistory: (atomicalAliasOrId: string | number) => Promise<any>;
  atomicalsList: (limit: number, offset: number, asc: boolean) => Promise<any>;
  atomicalsByScripthash: (scripthash: string, verbose?: boolean) => Promise<any>;
  atomicalsByAddress: (address: string) => Promise<any>;
  atomicalsAtLocation: (location: string) => Promise<any>;
  atomicalsGetByRealm: (realm: string) => Promise<any>;
  atomicalsGetRealmInfo: (realmOrSubRealm: string, verbose?: boolean) => Promise<any>;
  atomicalsGetByTicker: (ticker: string) => Promise<any>;
  atomicalsGetByContainer: (container: string) => Promise<any>;
  atomicalsFindTickers: (tickerPrefix: string | null, asc?: boolean) => Promise<any>;
  atomicalsFindContainers: (containerPrefix: string | null, asc?: boolean) => Promise<any>;
  atomicalsFindRealms: (realmPrefix: string | null, asc?: boolean) => Promise<any>;
  atomicalsFindSubRealms: (parentRealmId: string, subrealmPrefix: string | null, mostRecentFirst?: boolean) => Promise<any>;
}

export interface IAtomicalBalanceSummary {
  confirmed: number;
  type: 'FT' | 'NFT';
  atomical_number?: number;
  atomical_id?: number;
  $ticker?: string;
  $container?: string;
  $realm?: string;
  utxos: any[];
}

export interface ISelectedUtxo {
  txid: string;
  index: number;
  value: number;
  height: number;
  script: any;
  atomicals: string[];
}

export interface AmountToSend {
  address: string;
  value: number;
}

export interface IAtomicalsInfo {
  confirmed: number;
  type: 'FT' | 'NFT';
  utxos: Array<{
    txid: string;
    script: any;
    value: number;
    index: number;
    height: number;
  }>;
}

export interface IAtomicalBalances {
  [AtomId: string]: IAtomicalBalanceItem;
}

enum TickerStatus {
  'verified' = 'verified',
}

export interface TickerCandidate {
  atomical_id: string;
  commit_height: number;
  reveal_location_height: number;
  tx_num: number;
  txid: string;
}

export interface IAtomicalBalanceItem {
  atomical_id: string;
  atomical_number: number;
  confirmed: number;
  request_ticker: string;
  request_ticker_status: {
    status: TickerStatus;
    note: string;
    verified_atomical_id: string;
  };
  subtype: 'decentralized';
  ticker: string;
  ticker_candidate: TickerCandidate[];
  type: 'FT' | 'NFT';
}

export interface IAtomicalBalanceItemData {
  $bitwork: {
    bitworkc: string;
    birworkr?: string;
    $max_mints: number;
    $max_supply: number;
    $mint_amount: number;
    $mint_bitworkc: string;
    $mint_height: number;
    $request_ticker: string;
    $request_ticker_status: {
      status: TickerStatus;
      note: string;
      verified_atomical_id: string;
    };
    $ticker: string;
    $ticker_candidate: TickerCandidate[];
    atomical_id: string;
    atomical_number: number;
    atomical_ref: string;
    confirmed: boolean;
    mint_data?: any; // todo
    mint_info?: any; // dodo
    subtype: 'decentralized';
    type: 'FT' | 'NFT';
    // todo
  };
  $container?: string;
  $realm?: string;
}
