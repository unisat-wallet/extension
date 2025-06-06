import { ChainType } from '@/shared/constant';
import { AppInfo } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

export interface DiscoveryState {
  bannerList: { id: string; img: string; link: string }[];
  appList: { tab: string; items: AppInfo[] }[];
  lastFetchTime: number;
  lastFetchChainType: ChainType;
  cachedBannerIds: string[];
  hasNewBanner: boolean;
}

export const initialState: DiscoveryState = {
  bannerList: [],
  appList: [],
  lastFetchTime: 0,
  lastFetchChainType: ChainType.BITCOIN_MAINNET,
  cachedBannerIds: [],
  hasNewBanner: true
};

const slice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    reset(state) {
      return initialState;
    },
    setBannerList(
      state,
      action: {
        payload: {
          bannerList: { id: string; img: string; link: string }[];
          chainType: ChainType;
          fetchTime: number;
        };
      }
    ) {
      const { payload } = action;
      const newBannerIds = payload.bannerList.map((banner) => banner.id);
      const hasNewBanner = newBannerIds.some((id) => !state.cachedBannerIds.includes(id));

      state.bannerList = payload.bannerList;
      state.lastFetchChainType = payload.chainType;
      state.lastFetchTime = payload.fetchTime;
      state.hasNewBanner = hasNewBanner;

      state.cachedBannerIds = newBannerIds;
    },
    setAppList(
      state,
      action: {
        payload: {
          appList: { tab: string; items: AppInfo[] }[];
          chainType: ChainType;
          fetchTime: number;
        };
      }
    ) {
      const { payload } = action;
      state.appList = payload.appList;
      state.lastFetchChainType = payload.chainType;
      state.lastFetchTime = payload.fetchTime;
    },
    clearNewBannerFlag(state) {
      state.hasNewBanner = false;
    }
  }
});

export const discoveryActions = slice.actions;
export default slice.reducer;
