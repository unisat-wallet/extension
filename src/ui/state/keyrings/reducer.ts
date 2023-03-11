import { AddressType, WalletKeyring } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface KeyringsState {
  keyrings: WalletKeyring[];
  current: WalletKeyring;
}

const initialKeyring = {
  type: '',
  addressType: AddressType.P2TR,
  accounts: []
};

export const initialState: KeyringsState = {
  keyrings: [],
  current: initialKeyring
};

const slice = createSlice({
  name: 'keyrings',
  initialState,
  reducers: {
    setCurrent(state, action: { payload: WalletKeyring }) {
      const { payload } = action;
      state.current = payload || initialKeyring;
    },
    setKeyrings(state, action: { payload: WalletKeyring[] }) {
      const { payload } = action;
      state.keyrings = payload;
    },

    reset(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // todo
    });
  }
});

export const keyringsActions = slice.actions;
export default slice.reducer;
