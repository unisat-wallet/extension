import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export type TabOption = 'home' | 'mint' | 'app' | 'settings';

export interface GlobalState {
  tab: TabOption;
  isUnlocked: boolean;
  isReady: boolean;
  isBooted: boolean;
  advanceState: AdvanceOptionsState;
}

interface AdvanceOptionsState {
  hdName: string;
  hdPath: string;
  passphrase: string;
}

export const initialState: GlobalState = {
  tab: 'home',
  isUnlocked: false,
  isReady: false,
  isBooted: false,
  advanceState: {
    hdName: ADDRESS_TYPES[AddressType.P2PKH].name,
    hdPath: ADDRESS_TYPES[AddressType.P2PKH].hdPath,
    passphrase: ''
  }
};

const slice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    update(
      state,
      action: {
        payload: {
          tab?: TabOption;
          isUnlocked?: boolean;
          isReady?: boolean;
          isBooted?: boolean;
        };
      }
    ) {
      const { payload } = action;
      state = Object.assign({}, state, payload);
      return state;
    },

    updateAdvanceState(
      state,
      action: {
        payload: {
          hdPath?: string;
          hdName?: string;
          passphrase?: string;
        };
      }
    ) {
      const { payload } = action;
      state.advanceState = Object.assign({}, state.advanceState, payload);
      return state;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // todo
    });
  }
});

export const globalActions = slice.actions;
export default slice.reducer;
