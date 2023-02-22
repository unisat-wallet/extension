import { AddressType } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface SettingsState {
  locale: string;
  addressType: AddressType;
}

export const initialState: SettingsState = {
  locale: 'English',
  addressType: AddressType.P2TR
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
    });
  }
});

export const settingsActions = slice.actions;
export default slice.reducer;
