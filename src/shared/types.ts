import { CHAINS_ENUM } from './constant';

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR
}

export enum NetworkType {
  MAINNET,
  TESTNET
}

export interface Chain {
  name: string;
  logo: string;
  enum: CHAINS_ENUM;
  network: string;
}

export interface BitcoinBalance {
  confirm_amount: string;
  pending_amount: string;
  amount: string;
  usd_value: string;
}

export interface TxHistoryItem {
  txid: string;
  time: number;
  date: string;
  amount: string;
  symbol: string;
  address: string;
}

export interface Inscription {
  id: string;
  num: number;
  number: number;
  detail?: {
    address: string;
    content: string;
    content_length: string;
    content_type: string;
    genesis_fee: string;
    genesis_height: string;
    genesis_transaction: string;
    location: string;
    offset: string;
    output: string;
    output_value: string;
    preview: string;
    sat: string;
    timestamp: string;
  };
}

export interface InscriptionMintedItem {
  title: string;
  desc: string;
  inscriptions: Inscription[];
}

export interface InscriptionSummary {
  mintedList: InscriptionMintedItem[];
}

export interface AppInfo {
  logo: string;
  title: string;
  desc: string;
  url: string;
}

export interface AppSummary {
  apps: {
    tag: string;
    list: AppInfo[];
  }[];
}

export interface UTXO {
  txId: string;
  outputIndex: number;
  satoshis: number;
  scriptPk: string;
  isTaproot: boolean;
  inscriptions: {
    id: string;
    num: number;
    offset: number;
  }[];
}
