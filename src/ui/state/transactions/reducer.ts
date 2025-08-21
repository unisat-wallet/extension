import { Inscription } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';
import { UnspentOutput } from '@unisat/tx-helpers';

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

export interface RunesTx {
  fromAddress: string;
  toAddress: string;
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
  runeid?: string;
  runeAmount?: string;
}

export interface TransactionsState {
  bitcoinTx: BitcoinTx;
  ordinalsTx: OrdinalsTx;
  runesTx: RunesTx;
  utxos: UnspentOutput[];
  spendUnavailableUtxos: UnspentOutput[];
  assetUtxos_inscriptions: UnspentOutput[];
  assetUtxos_runes: UnspentOutput[];
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
      inscriptionNumber: 0,
      address: '',
      outputValue: 0,
      preview: '',
      content: '',
      contentType: '',
      contentLength: 0,
      timestamp: 0,
      genesisTransaction: '',
      location: '',
      output: '',
      offset: 0,
      contentBody: '',
      utxoHeight: 0,
      utxoConfirmation: 0
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

  runesTx: {
    fromAddress: '',
    toAddress: '',
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
  assetUtxos_inscriptions: [],
  assetUtxos_runes: []
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

    updateRunesTx(
      state,
      action: {
        payload: {
          fromAddress?: string;
          toAddress?: string;
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
          runeid?: string;
          runeAmount?: string;
        };
      }
    ) {
      const { payload } = action;
      state.runesTx = Object.assign({}, state.runesTx, payload);
    },
    setUtxos(state, action: { payload: UnspentOutput[] }) {
      state.utxos = action.payload;
    },
    setSpendUnavailableUtxos(state, action: { payload: UnspentOutput[] }) {
      state.spendUnavailableUtxos = action.payload;
    },

    setAssetUtxosInscriptions(state, action: { payload: UnspentOutput[] }) {
      state.assetUtxos_inscriptions = action.payload;
    },
    setAssetUtxosRunes(state, action: { payload: UnspentOutput[] }) {
      state.assetUtxos_runes = action.payload;
    },
    reset(state) {
      return initialState;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      if (!state.assetUtxos_inscriptions) {
        state.assetUtxos_inscriptions = [];
      }

      if (!state.spendUnavailableUtxos) {
        state.spendUnavailableUtxos = [];
      }

      if (!state.assetUtxos_runes) {
        state.assetUtxos_runes = [];
      }
    });
  }
});

export const transactionsActions = slice.actions;
export default slice.reducer;
