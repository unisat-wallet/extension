import { TxInfo } from './types';

export const initTxInfo: TxInfo = {
  changedBalance: 0,
  changedInscriptions: [],
  rawtx: '',
  psbtHex: '',
  toSignInputs: [],
  txError: '',
  decodedPsbt: {
    inputInfos: [],
    outputInfos: [],
    fee: 0,
    feeRate: 0,
    risks: [],
    features: {
      rbf: false
    },
    inscriptions: {},
    isScammer: false,
    shouldWarnFeeRate: false,
    recommendedFeeRate: 1
  },
  contractResults: []
};
