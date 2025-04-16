import { AppState } from '..';
import { useAppSelector } from '../hooks';

export function useDiscoveryState(): AppState['discovery'] {
  return useAppSelector((state) => state.discovery);
}

export function useAppList() {
  const state = useDiscoveryState();
  return state.appList;
}

export function useBannerList() {
  const state = useDiscoveryState();
  return state.bannerList;
}

export function useLastFetchInfo() {
  const state = useDiscoveryState();
  return {
    lastFetchTime: state.lastFetchTime,
    lasfFetchChainType: state.lastFetchChainType
  };
}

export function useHasNewBanner() {
  const state = useDiscoveryState();
  return state.hasNewBanner;
}
