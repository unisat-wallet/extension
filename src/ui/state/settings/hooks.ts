import compareVersions from 'compare-versions';
import { useCallback } from 'react';

import { CHAINS_MAP, ChainType, VERSION } from '@/shared/constant';
import { AddressType, NetworkType } from '@/shared/types';
import { useWallet } from '@/ui/utils';
import i18n, { addResourceBundle } from '@/ui/utils/i18n';
import { getAddressType } from '@unisat/wallet-sdk/lib/address';

import { AppState } from '..';
import { useCurrentAccount } from '../accounts/hooks';
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

export function useNetworkType() {
  const accountsState = useSettingsState();
  const chain = CHAINS_MAP[accountsState.chainType];
  if (chain) {
    return chain.networkType;
  } else {
    return NetworkType.TESTNET;
  }
}

export function useChangeNetworkTypeCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (type: NetworkType) => {
      if (type === NetworkType.MAINNET) {
        await wallet.setChainType(ChainType.BITCOIN_MAINNET);
        dispatch(
          settingsActions.updateSettings({
            chainType: ChainType.BITCOIN_MAINNET
          })
        );
      } else if (type === NetworkType.TESTNET) {
        await wallet.setChainType(ChainType.BITCOIN_TESTNET);
        dispatch(
          settingsActions.updateSettings({
            chainType: ChainType.BITCOIN_TESTNET
          })
        );
      }
    },
    [dispatch]
  );
}

export function useChainType() {
  const accountsState = useSettingsState();
  return accountsState.chainType;
}

export function useChain() {
  const accountsState = useSettingsState();
  return CHAINS_MAP[accountsState.chainType];
}

export function useChangeChainTypeCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (type: ChainType) => {
      dispatch(
        settingsActions.updateSettings({
          chainType: type
        })
      );
      await wallet.setChainType(type);
    },
    [dispatch]
  );
}

export function useBTCUnit() {
  const chainType = useChainType();
  return CHAINS_MAP[chainType].unit;
}

export function useTxExplorerUrl(txid: string) {
  const chain = useChain();
  if (chain.defaultExplorer === 'mempool-space') {
    return `${chain.mempoolSpaceUrl}/tx/${txid}`;
  } else {
    return `${chain.unisatExplorerUrl}/tx/${txid}`;
  }
}

export function useAddressExplorerUrl(address: string) {
  const chain = useChain();
  if (chain.defaultExplorer === 'mempool-space') {
    return `${chain.mempoolSpaceUrl}/address/${address}`;
  } else {
    return `${chain.unisatExplorerUrl}/address/${address}`;
  }
}

export function useCAT20TokenInfoExplorerUrl(tokenId: string) {
  const chain = useChain();
  return `${chain.unisatExplorerUrl}/cat20/${tokenId}`;
}

export function useUnisatWebsite() {
  const chainType = useChainType();
  return CHAINS_MAP[chainType].unisatUrl;
}

export function useOrdinalsWebsite() {
  const chainType = useChainType();
  return CHAINS_MAP[chainType].ordinalsUrl;
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
  let latestVersion = '';
  // skip if new version is empty
  if (!newVersion) {
    skipped = true;
  }

  // skip if skipped
  if (newVersion == skippedVersion) {
    skipped = true;
  }

  // skip if current version is greater or equal to new version
  if (newVersion) {
    if (compareVersions(currentVesion, newVersion) >= 0) {
      skipped = true;
    } else {
      latestVersion = newVersion;
    }
  }

  // skip if current version is 0.0.0
  if (currentVesion === '0.0.0') {
    skipped = true;
  }
  return {
    currentVesion,
    newVersion,
    latestVersion,
    skipped
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

export function useAutoLockTimeId() {
  const state = useSettingsState();
  return state.autoLockTimeId;
}

export function getAddressTips(address: string, chanEnum: ChainType) {
  let ret = {
    homeTip: '',
    sendTip: ''
  };
  try {
    const chain = CHAINS_MAP[chanEnum];
    const addressType = getAddressType(address, chain.networkType);
    if (chain.isFractal && addressType === AddressType.P2PKH) {
      ret = {
        homeTip:
          '⚠️  It is not recommended to use legacy addresses, as they may lead to higher transaction fees or the unintended lock-up of CAT20 balances.',
        sendTip:
          '⚠️  It is not recommended to send transactions to legacy addresses, as this may result in the unintended spending of CAT20 balances.'
      };
    }
  } catch (e) {
    console.log(e);
  }

  return ret;
}

export function useAddressTips() {
  const chain = useChain();
  const account = useCurrentAccount();
  return getAddressTips(account.address, chain.enum);
}
