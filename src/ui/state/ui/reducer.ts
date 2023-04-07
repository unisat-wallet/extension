import { createSlice } from '@reduxjs/toolkit';

export enum WalletTabScreenTabKey {
  ALL,
  BRC20
}
export interface UIState {
  walletTabScreen: {
    tabKey: WalletTabScreenTabKey;
  };
}

export const initialState: UIState = {
  walletTabScreen: {
    tabKey: WalletTabScreenTabKey.ALL
  }
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    updateWalletTabScreen(
      state,
      action: {
        payload: {
          tabKey: WalletTabScreenTabKey;
        };
      }
    ) {
      const { payload } = action;
      state.walletTabScreen = Object.assign({}, state.walletTabScreen, payload);
      return state;
    }
  },
  extraReducers: (builder) => {
    // todo
  }
});

export const uiActions = slice.actions;
export default slice.reducer;
