import { useCallback } from 'react';

import { Account, AddressType } from '@/shared/types';
import { useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useCurrentKeyring } from '../keyrings/hooks';
import { accountActions } from './reducer';

export function useAccountsState(): AppState['accounts'] {
  return useAppSelector((state) => state.accounts);
}

export function useCurrentAccount() {
  const accountsState = useAccountsState();
  return accountsState.current;
}

export function useAccounts() {
  const accountsState = useAccountsState();
  return accountsState.accounts;
}

export function useAccountBalance() {
  const accountsState = useAccountsState();
  const currentAccount = useCurrentAccount();
  return accountsState.balanceMap[currentAccount.address] || { amount: '0', expired: true };
}

export function useAccountInscriptions() {
  const accountsState = useAccountsState();
  const currentAccount = useCurrentAccount();
  return accountsState.inscriptionsMap[currentAccount.address] || { list: [], expired: true };
}

export function useInscriptionSummary() {
  const accountsState = useAccountsState();
  return accountsState.inscriptionSummary;
}

export function useAppSummary() {
  const accountsState = useAccountsState();
  return accountsState.appSummary;
}

export function useHistory() {
  const accountsState = useAccountsState();
  const address = useAccountAddress();
  return accountsState.historyMap[address] || { list: [], expired: true };
}

export function useAccountAddress() {
  const currentAccount = useCurrentAccount();
  return currentAccount.address;
}

export function useSetCurrentAccountCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (account: Account) => {
      dispatch(accountActions.setCurrent(account));
    },
    [dispatch]
  );
}

export function useImportAccountCallback() {
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const currentKeyring = useCurrentKeyring();
  return useCallback(
    async (privateKey: string, addressType: AddressType) => {
      let success = false;
      let error;
      try {
        const alianName = await wallet.getNextAlianName(currentKeyring);
        await wallet.createKeyringWithPrivateKey(privateKey, addressType, alianName);
        const currentAccount = await wallet.getCurrentAccount();
        dispatch(accountActions.setCurrent(currentAccount));

        success = true;
      } catch (e) {
        console.log(e);
        error = (e as any).message;
      }
      return { success, error };
    },
    [dispatch, wallet, currentKeyring]
  );
}

export function useChangeAccountNameCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  return useCallback(
    async (name: string) => {
      await wallet.updateAlianName(currentAccount.pubkey, name);
      dispatch(accountActions.setCurrentAccountName(name));
    },
    [dispatch, wallet, currentAccount]
  );
}

export function useFetchHistoryCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const address = useAccountAddress();
  return useCallback(async () => {
    const _accountHistory = await wallet.getAddressHistory(address);
    dispatch(
      accountActions.setHistory({
        address: address,
        list: _accountHistory
      })
    );
  }, [dispatch, wallet, address]);
}

export function useFetchBalanceCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const balance = useAccountBalance();
  return useCallback(async () => {
    if (!currentAccount.address) return;
    const cachedBalance = await wallet.getAddressCacheBalance(currentAccount.address);
    const _accountBalance = await wallet.getAddressBalance(currentAccount.address);
    dispatch(
      accountActions.setBalance({
        address: currentAccount.address,
        amount: _accountBalance.amount
      })
    );
    if (cachedBalance.amount !== _accountBalance.amount) {
      wallet.expireUICachedData(currentAccount.address);
      dispatch(accountActions.expireHistory());
    }
  }, [dispatch, wallet, currentAccount, balance]);
}
