import { Inscription } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface UIState {
  assetTabKey: AssetTabKey;
  ordinalsAssetTabKey: OrdinalsAssetTabKey;
  catAssetTabKey: CATAssetTabKey;
  alkanesAssetTabKey: AlkanesAssetTabKey;
  uiTxCreateScreen: {
    toInfo: {
      address: string;
      domain: string;
      inscription?: Inscription;
    };
    inputAmount: string;
    enableRBF: boolean;
    feeRate: number;
  };
  babylonSendScreen: {
    inputAmount: string;
    memo: string;
  };
  navigationSource: NavigationSource;
  isBalanceHidden: boolean;
}

export enum AssetTabKey {
  ORDINALS = 0,
  ATOMICALS = 1, // IGNORED
  RUNES = 2,
  CAT = 3,
  ALKANES = 4
}

export enum OrdinalsAssetTabKey {
  ALL = 0,
  BRC20 = 1,
  BRC20_5BYTE = 2
}

export enum CATAssetTabKey {
  CAT20,
  CAT721,
  CAT20_V2,
  CAT721_V2
}

export enum AlkanesAssetTabKey {
  TOKEN,
  COLLECTION
}

export enum NavigationSource {
  BACK,
  NORMAL
}

export const initialState: UIState = {
  assetTabKey: AssetTabKey.ORDINALS,
  ordinalsAssetTabKey: OrdinalsAssetTabKey.ALL,
  catAssetTabKey: CATAssetTabKey.CAT20,
  alkanesAssetTabKey: AlkanesAssetTabKey.TOKEN,
  uiTxCreateScreen: {
    toInfo: {
      address: '',
      domain: '',
      inscription: undefined
    },
    inputAmount: '',
    enableRBF: false,
    feeRate: 1
  },
  babylonSendScreen: {
    inputAmount: '',
    memo: ''
  },
  navigationSource: NavigationSource.NORMAL,
  isBalanceHidden: false
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    updateAssetTabScreen(
      state,
      action: {
        payload: {
          assetTabKey?: AssetTabKey;
          ordinalsAssetTabKey?: OrdinalsAssetTabKey;
          catAssetTabKey?: CATAssetTabKey;
          alkanesAssetTabKey?: AlkanesAssetTabKey;
        };
      }
    ) {
      const { payload } = action;
      if (payload.assetTabKey !== undefined) {
        state.assetTabKey = payload.assetTabKey;
      }
      if (payload.ordinalsAssetTabKey !== undefined) {
        state.ordinalsAssetTabKey = payload.ordinalsAssetTabKey;
      }

      if (payload.catAssetTabKey !== undefined) {
        state.catAssetTabKey = payload.catAssetTabKey;
      }
      if (payload.alkanesAssetTabKey !== undefined) {
        state.alkanesAssetTabKey = payload.alkanesAssetTabKey;
      }
      return state;
    },
    updateTxCreateScreen(
      state,
      action: {
        payload: {
          toInfo?: {
            address: string;
            domain: string;
            inscription?: Inscription;
          };
          inputAmount?: string;
          enableRBF?: boolean;
          feeRate?: number;
        };
      }
    ) {
      if (action.payload.toInfo !== undefined) {
        state.uiTxCreateScreen.toInfo = action.payload.toInfo;
      }
      if (action.payload.inputAmount !== undefined) {
        state.uiTxCreateScreen.inputAmount = action.payload.inputAmount;
      }
      if (action.payload.enableRBF !== undefined) {
        state.uiTxCreateScreen.enableRBF = action.payload.enableRBF;
      }
      if (action.payload.feeRate !== undefined) {
        state.uiTxCreateScreen.feeRate = action.payload.feeRate;
      }
    },
    resetTxCreateScreen(state) {
      state.uiTxCreateScreen = initialState.uiTxCreateScreen;
    },
    updateBabylonSendScreen(
      state,
      action: {
        payload: {
          inputAmount?: string;
          memo?: string;
        };
      }
    ) {
      if (action.payload.inputAmount !== undefined) {
        state.babylonSendScreen.inputAmount = action.payload.inputAmount;
      }
      if (action.payload.memo !== undefined) {
        state.babylonSendScreen.memo = action.payload.memo;
      }
    },
    resetBabylonSendScreen(state) {
      state.babylonSendScreen = initialState.babylonSendScreen;
    },
    setNavigationSource(state, action: { payload: NavigationSource }) {
      state.navigationSource = action.payload;
    },
    setBalanceHidden(state, action: { payload: boolean }) {
      state.isBalanceHidden = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // todo
      if (!state.assetTabKey) {
        state.assetTabKey = AssetTabKey.ORDINALS;
      }
      if (!state.ordinalsAssetTabKey) {
        state.ordinalsAssetTabKey = OrdinalsAssetTabKey.ALL;
      }
      if (!state.catAssetTabKey) {
        state.catAssetTabKey = CATAssetTabKey.CAT20;
      }
      if (!state.alkanesAssetTabKey) {
        state.alkanesAssetTabKey = AlkanesAssetTabKey.TOKEN;
      }
      if (!state.uiTxCreateScreen) {
        state.uiTxCreateScreen = initialState.uiTxCreateScreen;
      }
      if (!state.babylonSendScreen) {
        state.babylonSendScreen = initialState.babylonSendScreen;
      }
      if (state.isBalanceHidden === undefined) {
        state.isBalanceHidden = false;
      }
    });
  }
});

export const uiActions = slice.actions;
export default slice.reducer;
