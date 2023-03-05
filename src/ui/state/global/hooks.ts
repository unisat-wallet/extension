import { useCallback } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { useApproval, useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useChangeAddressTypeCallback } from '../settings/hooks';
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
  const changeAddressType = useChangeAddressTypeCallback();
  return useCallback(
    async (mnemonics: string, hdPath: string, passphrase: string) => {
      await wallet.createKeyringWithMnemonics(mnemonics, hdPath, passphrase);
      const typeInfo = ADDRESS_TYPES.find((v) => v.hdPath === hdPath);
      if (typeInfo) {
        await changeAddressType(typeInfo.value);
      }
      dispatch(globalActions.update({ isUnlocked: true }));
    },
    [dispatch, wallet, changeAddressType]
  );
}

export function useAdvanceState() {
  const globalState = useGlobalState();
  return globalState.advanceState;
}

export function useUpdateAdvanceStateCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    async (params: { hdPath?: string; hdName?: string; passphrase?: string }) => {
      dispatch(globalActions.updateAdvanceState(params));
    },
    [dispatch]
  );
}
