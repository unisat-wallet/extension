import { ChainType } from '@/shared/constant';
import { AddressType, Inscription } from '@/shared/types';
import { getAddressType } from '@unisat/wallet-sdk/lib/address';

import { AppState } from '..';
import { useCurrentAddress } from '../accounts/hooks';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useChainType, useNetworkType } from '../settings/hooks';
import { AssetTabKey, uiActions } from './reducer';

export function useUIState(): AppState['ui'] {
  return useAppSelector((state) => state.ui);
}

export function useAssetTabKey() {
  const uiState = useUIState();
  return uiState.assetTabKey;
}

export function useOrdinalsAssetTabKey() {
  const uiState = useUIState();
  return uiState.ordinalsAssetTabKey;
}

export function useAtomicalsAssetTabKey() {
  const uiState = useUIState();
  return uiState.atomicalsAssetTabKey;
}

export function useUiTxCreateScreen() {
  const uiState = useUIState();
  return uiState.uiTxCreateScreen;
}

export function useUpdateUiTxCreateScreen() {
  const dispatch = useAppDispatch();
  return ({
    toInfo,
    inputAmount,
    enableRBF,
    feeRate
  }: {
    toInfo?: { address: string; domain: string; inscription?: Inscription };
    inputAmount?: string;
    enableRBF?: boolean;
    feeRate?: number;
  }) => {
    dispatch(uiActions.updateTxCreateScreen({ toInfo, inputAmount, enableRBF, feeRate }));
  };
}

export function useResetUiTxCreateScreen() {
  const dispatch = useAppDispatch();
  return () => {
    dispatch(uiActions.resetTxCreateScreen());
  };
}

export function useSupportedAssets() {
  const chainType = useChainType();
  const currentAddress = useCurrentAddress();
  const networkType = useNetworkType();

  const assetTabKeys: AssetTabKey[] = [];
  const assets = {
    ordinals: false,
    atomicals: false,
    runes: false,
    CAT20: false
  };

  assets.ordinals = true;
  assetTabKeys.push(AssetTabKey.ORDINALS);

  if (chainType === ChainType.BITCOIN_MAINNET) {
    assets.atomicals = true;
    assetTabKeys.push(AssetTabKey.ATOMICALS);
  }

  assets.runes = true;
  assetTabKeys.push(AssetTabKey.RUNES);

  if (chainType === ChainType.FRACTAL_BITCOIN_MAINNET || chainType === ChainType.FRACTAL_BITCOIN_TESTNET) {
    const addressType = getAddressType(currentAddress, networkType);
    if (addressType == AddressType.P2TR || addressType == AddressType.P2WPKH) {
      assets.CAT20 = true;
      assetTabKeys.push(AssetTabKey.CAT20);
    }
  }

  return {
    tabKeys: assetTabKeys,
    assets,
    key: assetTabKeys.join(',')
  };
}
