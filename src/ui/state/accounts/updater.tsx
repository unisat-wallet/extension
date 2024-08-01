import { useCallback, useEffect, useRef } from 'react';

import eventBus from '@/shared/eventBus';
import { Account } from '@/shared/types';
import { useWallet } from '@/ui/utils';

import { useIsUnlocked } from '../global/hooks';
import { useAppDispatch } from '../hooks';
import { useAccountBalance, useCurrentAccount, useFetchBalanceCallback, useReloadAccounts } from './hooks';
import { accountActions } from './reducer';

export default function AccountUpdater() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const currentAccount = useCurrentAccount();
    const isUnlocked = useIsUnlocked();
    const balance = useAccountBalance();
    const selfRef = useRef({
        preAccountKey: '',
        loadingBalance: false,
        loadingHistory: false
    });
    const self = selfRef.current;

    const reloadAccounts = useReloadAccounts();
    const onCurrentChange = useCallback(async () => {
        if (isUnlocked && currentAccount && currentAccount.key != self.preAccountKey) {
            self.preAccountKey = currentAccount.key;

            // setLoading(true);

            reloadAccounts();

            // setLoading(false);
        }
    }, [dispatch, currentAccount, wallet, isUnlocked]);

    useEffect(() => {
        onCurrentChange();
    }, [currentAccount && currentAccount.key, isUnlocked]);

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
