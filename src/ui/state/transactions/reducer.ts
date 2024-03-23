import { Inscription } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';
import { UnspentOutput } from '@unisat/wallet-sdk';

import { updateVersion } from '../global/actions';

export interface BitcoinTx {
  fromAddress: string;
  toAddress: string;
  toSatoshis: number;
  rawtx: string;
  txid: string;
  fee: number;
  estimateFee: number;
  changeSatoshis: number;
  sending: boolean;
  autoAdjust: boolean;
  psbtHex: string;
  feeRate: number;
  toDomain: string;
  enableRBF: boolean;
}

export interface OrdinalsTx {
  fromAddress: string;
  toAddress: string;
  inscription: Inscription;
  rawtx: string;
  txid: string;
  fee: number;
  estimateFee: number;
  changeSatoshis: number;
  sending: boolean;
  psbtHex: string;
  feeRate: number;
  toDomain: string;
  outputValue: number;
  enableRBF: boolean;
}

export interface AtomicalsTx {
  fromAddress: string;
  toAddress: string;
  inscription: Inscription;
  rawtx: string;
  txid: string;
  fee: number;
  estimateFee: number;
  changeSatoshis: number;
  sending: boolean;
  psbtHex: string;
  feeRate: number;
  toDomain: string;
  outputValue: number;
  sendArc20Amount?: number;
  enableRBF: boolean;
}

export interface TransactionsState {
  bitcoinTx: BitcoinTx;
  ordinalsTx: OrdinalsTx;
  atomicalsTx: AtomicalsTx;
  utxos: UnspentOutput[];
  spendUnavailableUtxos: UnspentOutput[];
  assetUtxos_atomicals_ft: UnspentOutput[];
  assetUtxos_atomicals_nft: UnspentOutput[];
  assetUtxos_inscriptions: UnspentOutput[];
}

export const initialState: TransactionsState = {
  bitcoinTx: {
    fromAddress: '',
    toAddress: '',
    toSatoshis: 0,
    rawtx: '',
    txid: '',
    fee: 0,
    estimateFee: 0,
    changeSatoshis: 0,
    sending: false,
    autoAdjust: false,
    psbtHex: '',
    feeRate: 5,
    toDomain: '',
    enableRBF: false
  },
  ordinalsTx: {
    fromAddress: '',
    toAddress: '',
    inscription: {
      inscriptionId: '',
      inscriptionNumber: 0
    },
    rawtx: '',
    txid: '',
    fee: 0,
    estimateFee: 0,
    changeSatoshis: 0,
    sending: false,
    psbtHex: '',
    feeRate: 5,
    toDomain: '',
    outputValue: 10000,
    enableRBF: false
  },
  atomicalsTx: {
    fromAddress: '',
    toAddress: '',
    inscription: {
      inscriptionId: '',
      inscriptionNumber: 0
    },
    rawtx: '',
    txid: '',
    fee: 0,
    estimateFee: 0,
    changeSatoshis: 0,
    sending: false,
    psbtHex: '',
    feeRate: 5,
    toDomain: '',
    outputValue: 10000,
    enableRBF: false
  },
  utxos: [],
  spendUnavailableUtxos: [],
  assetUtxos_atomicals_ft: [],
  assetUtxos_atomicals_nft: [],
  assetUtxos_inscriptions: []
};

const slice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    updateBitcoinTx(
      state,
      action: {
        payload: {
          fromAddress?: string;
          toAddress?: string;
          toSatoshis?: number;
          changeSatoshis?: number;
          rawtx?: string;
          txid?: string;
          fee?: number;
          estimateFee?: number;
          sending?: boolean;
          autoAdjust?: boolean;
          psbtHex?: string;
          feeRate?: number;
          toDomain?: string;
          enableRBF?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state.bitcoinTx = Object.assign({}, state.bitcoinTx, payload);
    },
    updateOrdinalsTx(
      state,
      action: {
        payload: {
          fromAddress?: string;
          toAddress?: string;
          inscription?: Inscription;
          changeSatoshis?: number;
          rawtx?: string;
          txid?: string;
          fee?: number;
          estimateFee?: number;
          sending?: boolean;
          psbtHex?: string;
          feeRate?: number;
          toDomain?: string;
          outputValue?: number;
          enableRBF?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state.ordinalsTx = Object.assign({}, state.ordinalsTx, payload);
    },
    updateAtomicalsTx(
      state,
      action: {
        payload: {
          fromAddress?: string;
          toAddress?: string;
          inscription?: Inscription;
          changeSatoshis?: number;
          rawtx?: string;
          txid?: string;
          fee?: number;
          estimateFee?: number;
          sending?: boolean;
          psbtHex?: string;
          feeRate?: number;
          toDomain?: string;
          outputValue?: number;
          sendArc20Amount?: number;
          enableRBF?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state.atomicalsTx = Object.assign({}, state.atomicalsTx, payload);
    },
    setUtxos(state, action: { payload: UnspentOutput[] }) {
      state.utxos = action.payload;
    },
    setSpendUnavailableUtxos(state, action: { payload: UnspentOutput[] }) {
      state.spendUnavailableUtxos = action.payload;
    },
    setAssetUtxosAtomicalsFT(state, action: { payload: UnspentOutput[] }) {
      state.assetUtxos_atomicals_ft = action.payload;
    },
    setAssetUtxosAtomicalsNFT(state, action: { payload: UnspentOutput[] }) {
      state.assetUtxos_atomicals_nft = action.payload;
    },
    setAssetUtxosInscriptions(state, action: { payload: UnspentOutput[] }) {
      state.assetUtxos_inscriptions = action.payload;
    },
    reset(state) {
      return initialState;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      //  todo
      if (!state.assetUtxos_atomicals_ft) {
        state.assetUtxos_atomicals_ft = [];
      }

      if (!state.assetUtxos_atomicals_nft) {
        state.assetUtxos_atomicals_nft = [];
      }

      if (!state.assetUtxos_inscriptions) {
        state.assetUtxos_inscriptions = [];
      }

      if (!state.spendUnavailableUtxos) {
        state.spendUnavailableUtxos = [];
      }
    });
  }
});

export const transactionsActions = slice.actions;
export default slice.reducer;
