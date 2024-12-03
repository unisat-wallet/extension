import { AppState } from '..';
import { useAppSelector } from '../hooks';

export function useDiscoveryState(): AppState['discovery'] {
  return useAppSelector((state) => state.discovery);
}

export function useAppList() {
  const accountsState = useDiscoveryState();
  return accountsState.appList;
}

export function useBannerList() {
  const accountsState = useDiscoveryState();
  return accountsState.bannerList;
}
