import { useCallback } from 'react';

import { NetworkType } from '@/shared/types';
import { useWallet } from '@/ui/utils';
import i18n, { addResourceBundle } from '@/ui/utils/i18n';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { settingsActions } from './reducer';

export function useSettingsState(): AppState['settings'] {
  return useAppSelector((state) => state.settings);
}

export function useLocale() {
  const settings = useSettingsState();
  return settings.locale;
}

export function useChangeLocaleCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (locale: string) => {
      await wallet.setLocale(locale);
      await addResourceBundle(locale);
      i18n.changeLanguage(locale);
      dispatch(
        settingsActions.updateSettings({
          locale
        })
      );

      window.location.reload();
    },
    [dispatch, wallet]
  );
}

export function useAddressType() {
  const accountsState = useSettingsState();
  return accountsState.addressType;
}

export function useNetworkType() {
  const accountsState = useSettingsState();
  return accountsState.networkType;
}

export function useChangeNetworkTypeCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (type: NetworkType) => {
      await wallet.setNetworkType(type);
      dispatch(
        settingsActions.updateSettings({
          networkType: type
        })
      );
    },
    [dispatch]
  );
}

export function useBlockstreamUrl() {
  const networkType = useNetworkType();
  if (networkType === NetworkType.MAINNET) {
    return 'https://blockstream.info';
  } else {
    return 'https://blockstream.info/testnet';
  }
}

export function useTxIdUrl(txid: string) {
  const networkType = useNetworkType();
  if (networkType === NetworkType.MAINNET) {
    return `https://blockstream.info/tx/${txid}`;
  } else {
    return `https://blockstream.info/testnet/tx/${txid}`;
  }
}
