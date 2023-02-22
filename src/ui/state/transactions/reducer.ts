import { Inscription, UTXO } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface BitcoinTx {
  fromAddress: string;
  toAddress: string;
  toAmount: number;
  rawtx: string;
  txid: string;
  fee: number;
  changeAmount: number;
  sending: boolean;
}

export interface OrdinalsTx {
  fromAddress: string;
  toAddress: string;
  inscription: Inscription;
  rawtx: string;
  txid: string;
  fee: number;
  changeAmount: number;
  sending: boolean;
}

export interface TransactionsState {
  bitcoinTx: BitcoinTx;
  ordinalsTx: OrdinalsTx;
  utxos: UTXO[];
}

export const initialState: TransactionsState = {
  bitcoinTx: {
    fromAddress: '',
    toAddress: '',
    toAmount: 0,
    rawtx: '',
    txid: '',
    fee: 0,
    changeAmount: 0,
    sending: false
  },
  ordinalsTx: {
    fromAddress: '',
    toAddress: '',
    inscription: {
      id: '',
      num: 0
    },
    rawtx: '',
    txid: '',
    fee: 0,
    changeAmount: 0,
    sending: false
  },
  utxos: []
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
          toAmount?: number;
          changeAmount?: number;
          rawtx?: string;
          txid?: string;
          fee?: number;
          sending?: boolean;
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
          changeAmount?: number;
          rawtx?: string;
          txid?: string;
          fee?: number;
          sending?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state.ordinalsTx = Object.assign({}, state.ordinalsTx, payload);
    },
    setUtxos(state, action: { payload: UTXO[] }) {
      state.utxos = action.payload;
    },
    reset(state) {
      return initialState;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      //  todo
    });
  }
});

export const transactionsActions = slice.actions;
export default slice.reducer;
