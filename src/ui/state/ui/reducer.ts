import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface UIState {
  assetTabKey: AssetTabKey;
  ordinalsAssetTabKey: OrdinalsAssetTabKey;
  atomicalsAssetTabKey: AtomicalsAssetTabKey;
}

export enum AssetTabKey {
  ORDINALS,
  ATOMICALS
}

export enum OrdinalsAssetTabKey {
  ALL,
  BRC20
}

export enum AtomicalsAssetTabKey {
  ALL,
  ARC20,
  OTHERS
}

export const initialState: UIState = {
  assetTabKey: AssetTabKey.ORDINALS,
  ordinalsAssetTabKey: OrdinalsAssetTabKey.ALL,
  atomicalsAssetTabKey: AtomicalsAssetTabKey.ARC20
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
          atomicalsAssetTabKey?: AtomicalsAssetTabKey;
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
      if (payload.atomicalsAssetTabKey !== undefined) {
        state.atomicalsAssetTabKey = payload.atomicalsAssetTabKey;
      }
      return state;
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
      if (!state.atomicalsAssetTabKey) {
        state.atomicalsAssetTabKey = AtomicalsAssetTabKey.ARC20;
      }
    });
  }
});

export const uiActions = slice.actions;
export default slice.reducer;
