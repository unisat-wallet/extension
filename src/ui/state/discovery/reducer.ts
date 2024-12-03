import { AppInfo } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

export interface DiscoveryState {
  bannerList: { id: string; img: string; link: string }[];
  appList: { tab: string; items: AppInfo[] }[];
}

export const initialState: DiscoveryState = {
  bannerList: [],
  appList: []
};

const slice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    setBannerList(state, action: { payload: { id: string; img: string; link: string }[] }) {
      const { payload } = action;
      state.bannerList = payload;
    },
    setAppList(state, action: { payload: { tab: string; items: AppInfo[] }[] }) {
      const { payload } = action;
      state.appList = payload;
    }
  }
});

export const discoveryActions = slice.actions;
export default slice.reducer;
