import { useCallback } from 'react';

import { useApproval, useWallet } from '@/ui/utils';
import { AddressType } from '@unisat/ord-utils/lib/OrdTransaction';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { globalActions, TabOption } from './reducer';

export function useGlobalState(): AppState['global'] {
  return useAppSelector((state) => state.global);
}

export function useTab() {
  const globalState = useGlobalState();
  return globalState.tab;
}

export function useSetTabCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (tab: TabOption) => {
      dispatch(
        globalActions.update({
          tab
        })
      );
    },
    [dispatch]
  );
}

export function useIsUnlocked() {
  const globalState = useGlobalState();
  return globalState.isUnlocked;
}

export function useIsReady() {
  const globalState = useGlobalState();
  return globalState.isReady;
}

export function useUnlockCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const [, resolveApproval] = useApproval();
  return useCallback(
    async (password: string) => {
      await wallet.unlock(password);
      dispatch(globalActions.update({ isUnlocked: true }));
      resolveApproval();
    },
    [dispatch, wallet]
  );
}

export function useCreateAccountCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  return useCallback(
    async (mnemonics: string, hdPath: string, passphrase: string, addressType: AddressType) => {
      await wallet.createKeyringWithMnemonics(mnemonics, hdPath, passphrase, addressType);
      dispatch(globalActions.update({ isUnlocked: true }));
    },
    [dispatch, wallet]
  );
}
