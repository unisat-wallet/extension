import { AddressType, NetworkType, WalletConfig } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface SettingsState {
  locale: string;
  addressType: AddressType;
  networkType: NetworkType;
  walletConfig: WalletConfig;
  skippedVersion: string;
}

export const initialState: SettingsState = {
  locale: 'English',
  addressType: AddressType.P2TR,
  networkType: NetworkType.MAINNET,
  walletConfig: {
    version: '',
    moonPayEnabled: true,
    statusMessage: ''
  },
  skippedVersion: ''
};

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    updateSettings(
      state,
      action: {
        payload: {
          locale?: string;
          addressType?: AddressType;
          networkType?: NetworkType;
          walletConfig?: WalletConfig;
          skippedVersion?: string;
        };
      }
    ) {
      const { payload } = action;
      state = Object.assign({}, state, payload);
      return state;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // todo
      if (!state.networkType) {
        state.networkType = NetworkType.MAINNET;
      }
    });
  }
});

export const settingsActions = slice.actions;
export default slice.reducer;
