import {
  AlkanesBalance,
  Atomical,
  ContractResult,
  DecodedPsbt,
  Inscription,
  RawTxInfo,
  RuneBalance,
  SignPsbtOptions,
  ToSignInput,
  TxType
} from '@/shared/types';

export interface Props {
  header?: React.ReactNode;
  params: {
    data: {
      type: TxType;

      psbtHex: string;
      options?: SignPsbtOptions;
      rawTxInfo?: RawTxInfo;

      sendBitcoinParams?: {
        toAddress: string;
        satoshis: number;
        memo: string;
        memos: string[];
        feeRate: number;
      };
      sendInscriptionParams?: {
        toAddress: string;
        inscriptionId: string;
        feeRate: number;
      };
      sendRunesParams?: {
        toAddress: string;
        runeid: string;
        amount: string;
        feeRate: number;
      };
      sendAlkanesParams?: {
        toAddress: string;
        alkaneid: string;
        amount: string;
        feeRate: number;
      };
    };
    session?: {
      origin: string;
      icon: string;
      name: string;
    };
  };
  handleCancel?: () => void;
  handleConfirm?: (rawTxInfo?: RawTxInfo) => void;
}

export interface InputInfo {
  txid: string;
  vout: number;
  address: string;
  value: number;
  inscriptions: Inscription[];
  atomicals: Atomical[];
  runes: RuneBalance[];
  alkanes: AlkanesBalance[];
}

export interface OutputInfo {
  address: string;
  value: number;
}

export enum TabState {
  DETAILS,
  DATA,
  HEX
}

export interface InscriptioinInfo {
  id: string;
  isSent: boolean;
}

export interface TxInfo {
  changedBalance: number;
  changedInscriptions: InscriptioinInfo[];
  rawtx: string;
  psbtHex: string;
  toSignInputs: ToSignInput[];
  txError: string;
  decodedPsbt: DecodedPsbt;
  contractResults: ContractResult[];
}
