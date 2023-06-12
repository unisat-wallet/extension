import { useCallback } from 'react';

import { CHANNEL, VERSION } from '@/shared/constant';
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
    return 'https://mempool.space';
  } else {
    return 'https://mempool.space/testnet';
  }
}

export function useTxIdUrl(txid: string) {
  const networkType = useNetworkType();
  if (networkType === NetworkType.MAINNET) {
    return `https://mempool.space/tx/${txid}`;
  } else {
    return `https://mempool.space/testnet/tx/${txid}`;
  }
}

export function useWalletConfig() {
  const accountsState = useSettingsState();
  return accountsState.walletConfig;
}

export function useVersionInfo() {
  const accountsState = useSettingsState();
  const walletConfig = accountsState.walletConfig;
  const newVersion = walletConfig.version;
  const skippedVersion = accountsState.skippedVersion;
  const currentVesion = VERSION;
  let skipped = false;
  if (!newVersion) {
    // skip if not initialized
    skipped = true;
  }
  if (newVersion === currentVesion) {
    skipped = true;
  } else if (newVersion == skippedVersion) {
    skipped = true;
  }
  if (currentVesion === '0.0.0') {
    // skip in dev mode
    skipped = true;
  }
  if (CHANNEL !== 'github') {
    // skip in other channels
    skipped = true;
  }
  const githubUrl = `https://github.com/unisat-wallet/extension/releases/tag/v${newVersion}`;
  const chromeUrl = 'https://chrome.google.com/webstore/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo?hl=en-US';
  const downloadUrl = CHANNEL === 'github' ? githubUrl : chromeUrl;
  return {
    currentVesion,
    newVersion,
    skipped,
    downloadUrl
  };
}

export function useSkipVersionCallback() {
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  return useCallback((version: string) => {
    wallet.setSkippedVersion(version).then((v) => {
      dispatch(settingsActions.updateSettings({ skippedVersion: version }));
    });
  }, []);
}
