import { useCallback, useEffect, useRef } from 'react';

import { Account } from '@/background/service/preference';
import eventBus from '@/shared/eventBus';
import { useWallet } from '@/ui/utils';

import { useIsUnlocked } from '../global/hooks';
import { useAppDispatch } from '../hooks';
import { useAccountBalance, useCurrentAccount, useFetchBalanceCallback, useFetchInscriptionsCallback } from './hooks';
import { accountActions } from './reducer';

export default function AccountUpdater() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const isUnlocked = useIsUnlocked();
  const balance = useAccountBalance();
  const selfRef = useRef({
    preAddress: '',
    loadingBalance: false,
    loadingHistory: false
  });
  const self = selfRef.current;

  const onCurrentChange = useCallback(async () => {
    if (isUnlocked && currentAccount && currentAccount.address != self.preAddress) {
      self.preAddress = currentAccount.address;

      // setLoading(true);
      const _accounts = await wallet.getAccounts();
      dispatch(accountActions.setAccounts(_accounts));
      dispatch(accountActions.expireBalance());
      dispatch(accountActions.expireInscriptions());
      // setLoading(false);
    }
  }, [dispatch, currentAccount, wallet, isUnlocked]);

  useEffect(() => {
    onCurrentChange();
  }, [currentAccount && currentAccount.address, isUnlocked]);

  const fetchInscription = useFetchInscriptionsCallback();

  const fetchBalance = useFetchBalanceCallback();
  useEffect(() => {
    if (self.loadingBalance) {
      return;
    }
    if (!isUnlocked) {
      return;
    }
    if (!balance.expired) {
      return;
    }
    self.loadingBalance = true;
    fetchBalance().finally(() => {
      self.loadingBalance = false;
    });
    fetchInscription();
  }, [fetchBalance, wallet, isUnlocked, self]);

  useEffect(() => {
    const accountChangeHandler = (account: Account) => {
      if (account && account.address) {
        dispatch(accountActions.setCurrent(account));
      }
    };
    eventBus.addEventListener('accountsChanged', accountChangeHandler);
    return () => {
      eventBus.removeEventListener('accountsChanged', accountChangeHandler);
    };
  }, [dispatch]);

  return null;
}
