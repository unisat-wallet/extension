import { Account, AppSummary, Inscription, InscriptionSummary, TxHistoryItem } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface AccountsState {
  accounts: Account[];
  current: Account;
  loading: boolean;
  balanceMap: {
    [key: string]: {
      amount: string;
      expired: boolean;
    };
  };
  historyMap: {
    [key: string]: {
      list: TxHistoryItem[];
      expired: boolean;
    };
  };
  inscriptionsMap: {
    [key: string]: {
      list: Inscription[];
      expired: boolean;
    };
  };
  appSummary: AppSummary;
  inscriptionSummary: InscriptionSummary;
}

const initialAccount = {
  type: '',
  address: '',
  brandName: '',
  alianName: '',
  displayBrandName: '',
  index: 0,
  balance: 0,
  pubkey: '',
  key: ''
};

export const initialState: AccountsState = {
  accounts: [],
  current: initialAccount,
  loading: false,
  balanceMap: {},
  historyMap: {},
  inscriptionsMap: {},
  appSummary: {
    apps: []
  },
  inscriptionSummary: {
    mintedList: []
  }
};

const slice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    pendingLogin(state) {
      state.loading = true;
    },
    setCurrent(state, action: { payload: Account }) {
      const { payload } = action;
      state.current = payload || initialAccount;
    },
    setAccounts(state, action: { payload: Account[] }) {
      const { payload } = action;
      state.accounts = payload;
    },
    setBalance(
      state,
      action: {
        payload: {
          address: string;
          amount: string;
        };
      }
    ) {
      const {
        payload: { address, amount }
      } = action;
      state.balanceMap[address] = state.balanceMap[address] || {
        amount: '0',
        expired: true
      };
      state.balanceMap[address].amount = amount;
      state.balanceMap[address].expired = false;
    },
    expireBalance(state) {
      const balance = state.balanceMap[state.current.address];
      if (balance) {
        balance.expired = true;
      }
    },
    setHistory(state, action: { payload: { address: string; list: TxHistoryItem[] } }) {
      const {
        payload: { address, list }
      } = action;
      state.historyMap[address] = state.historyMap[address] || {
        list: [],
        expired: true
      };
      state.historyMap[address].list = list;
      state.historyMap[address].expired = false;
    },
    expireHistory(state) {
      const history = state.historyMap[state.current.address];
      if (history) {
        history.expired = true;
      }
    },
    setInscriptions(state, action: { payload: { address: string; list: Inscription[] } }) {
      const {
        payload: { address, list }
      } = action;
      state.inscriptionsMap[address] = state.inscriptionsMap[address] || {
        list: [],
        expired: true
      };
      state.inscriptionsMap[address].list = list;
      state.inscriptionsMap[address].expired = false;
    },
    expireInscriptions(state) {
      const inscriptions = state.inscriptionsMap[state.current.address];
      if (inscriptions) {
        inscriptions.expired = true;
      }
    },
    setCurrentAccountName(state, action: { payload: string }) {
      const { payload } = action;
      state.current.alianName = payload;
      const account = state.accounts.find((v) => v.address === state.current.address);
      if (account) {
        account.alianName = payload;
      }
    },
    setInscriptionSummary(state, action: { payload: InscriptionSummary }) {
      const { payload } = action;
      state.inscriptionSummary = payload;
    },
    setAppSummary(state, action: { payload: AppSummary }) {
      const { payload } = action;
      state.appSummary = payload;
    },
    rejectLogin(state) {
      state.loading = false;
    },
    reset(state) {
      return initialState;
    },
    updateAccountName(
      state,
      action: {
        payload: Account;
      }
    ) {
      const account = action.payload;
      if (state.current.key === account.key) {
        state.current.alianName = account.alianName;
      }
      state.accounts.forEach((v) => {
        if (v.key === account.key) {
          v.alianName = account.alianName;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // todo
    });
  }
});

export const accountActions = slice.actions;
export default slice.reducer;
