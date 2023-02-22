import { useCallback } from 'react';

import { AddressType } from '@/shared/types';
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

export function useChangeAddressTypeCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    async (type: AddressType) => {
      dispatch(
        settingsActions.updateSettings({
          addressType: type
        })
      );
    },
    [dispatch]
  );
}
