import { useCallback } from 'react';

import { Account } from '@/background/service/preference';
import { publicKeyToAddress } from '@/background/utils/tx-utils';
import { KEYRING_CLASS } from '@/shared/constant';
import { useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useAddressType, useNetworkType } from '../settings/hooks';
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
  const addressType = useAddressType();
  const networkType = useNetworkType();
  const currentAccount = useCurrentAccount();
  return publicKeyToAddress(currentAccount.address, addressType, networkType);
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
  return useCallback(
    async (privateKey: string) => {
      let success = false;
      let error;
      try {
        const alianName = await wallet.getNextAccountAlianName(KEYRING_CLASS.PRIVATE_KEY);
        await wallet.importPrivateKey(privateKey, alianName);
        const currentAccount = await wallet.getCurrentAccount();
        dispatch(accountActions.setCurrent(currentAccount));

        success = true;
      } catch (e) {
        console.log(e);
        error = (e as any).message;
      }
      return { success, error };
    },
    [dispatch, wallet]
  );
}

export function useChangeAccountNameCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  return useCallback(
    async (name: string) => {
      await wallet.updateAlianName(currentAccount.address, name);
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
    const preBalanceAmount = balance.amount;
    const _accountBalance = await wallet.getAddressBalance(currentAccount.address);
    dispatch(
      accountActions.setBalance({
        address: currentAccount.address,
        amount: _accountBalance.amount
      })
    );
    if (preBalanceAmount !== _accountBalance.amount) {
      dispatch(accountActions.expireHistory());
    }
  }, [dispatch, wallet, currentAccount, balance]);
}

export function useFetchInscriptionsCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  return useCallback(async () => {
    const inscriptions = await wallet.getAddressInscriptions(currentAccount.address);
    dispatch(
      accountActions.setInscriptions({
        address: currentAccount.address,
        list: inscriptions
      })
    );
  }, [dispatch, wallet, currentAccount]);
}
