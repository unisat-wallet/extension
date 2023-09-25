export interface UTXO {
  txid: string;
  txId: string;
  index: number;
  vout: number;
  value: number;
  script?: string;
  height?: number;
  outputIndex: number;
  atomicals?: any[];
}

export interface BalanceData {
  balance: string;
  unconfirmed: number;
  confirmed: number;
  utxos: UTXO[];
}

export interface IInputUtxoPartial {
  hash: string;
  index: number;
  address: string;
  witnessUtxo: {
    value: number;
    script: Uint8Array;
  };
}
