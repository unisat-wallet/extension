import { useCallback, useMemo } from 'react';

import { Inscription } from '@/shared/types';
import { satoshisToBTC, useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAccountAddress, useCurrentAccount } from '../accounts/hooks';
import { accountActions } from '../accounts/reducer';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useAddressType } from '../settings/hooks';
import { transactionsActions } from './reducer';

export function useTransactionsState(): AppState['transactions'] {
  return useAppSelector((state) => state.transactions);
}

export function useBitcoinTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.bitcoinTx;
}

export function useCreateBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const bitcoinTx = useBitcoinTx();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const addressType = useAddressType();
  const utxos = useUtxos();
  return useCallback(
    async (toAddress: string, toAmount: number) => {
      const result = await wallet.sendBTC({ to: toAddress, amount: toAmount, addressType, utxos });
      const changeAmount = fromAddress === toAddress ? 0 : toAmount + result.fee;
      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx: result.rawtx,
          fee: result.fee,
          toAddress,
          fromAddress,
          toAmount: result.toAmount,
          changeAmount
        })
      );
      return result.toAmount;
    },
    [dispatch, bitcoinTx, wallet, fromAddress, addressType, utxos]
  );
}

export function usePushBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const bitcoinTx = useBitcoinTx();
  const wallet = useWallet();
  return useCallback(async () => {
    let success = false;
    try {
      dispatch(transactionsActions.updateBitcoinTx({ sending: true }));
      const txid = await wallet.pushTx(bitcoinTx.rawtx);
      dispatch(transactionsActions.updateBitcoinTx({ txid, sending: false }));
      dispatch(accountActions.expireBalance());
      success = true;
    } catch (e) {
      console.log(e);
      dispatch(transactionsActions.updateBitcoinTx({ sending: false }));
    }

    return success;
  }, [dispatch, bitcoinTx, wallet]);
}

export function useOrdinalsTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.ordinalsTx;
}

export function useCreateOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const ordinalsTx = useOrdinalsTx();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const addressType = useAddressType();
  const utxos = useUtxos();
  return useCallback(
    async (toAddress: string, inscription: Inscription) => {
      const result = await wallet.sendInscription({ to: toAddress, inscriptionId: inscription.id, addressType, utxos });
      const changeAmount = fromAddress === toAddress ? 0 : result.fee;
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx: result.rawtx,
          fee: result.fee,
          fromAddress,
          toAddress,
          inscription,
          changeAmount
        })
      );
    },
    [dispatch, ordinalsTx, wallet, fromAddress, addressType, utxos]
  );
}

export function usePushOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const ordinalsTx = useOrdinalsTx();
  const wallet = useWallet();
  return useCallback(async () => {
    let success = false;
    try {
      dispatch(transactionsActions.updateOrdinalsTx({ sending: true }));
      const txid = await wallet.pushTx(ordinalsTx.rawtx);
      dispatch(transactionsActions.updateOrdinalsTx({ txid, sending: false }));
      dispatch(accountActions.expireBalance());
      success = true;
    } catch (e) {
      console.log(e);
      dispatch(transactionsActions.updateOrdinalsTx({ sending: false }));
    }

    return success;
  }, [dispatch, ordinalsTx, wallet]);
}

export function useUtxos() {
  const transactionsState = useTransactionsState();
  return transactionsState.utxos;
}

export function useFetchUtxosCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const account = useCurrentAccount();
  return useCallback(async () => {
    const data = await wallet.getAddressUtxo(account.address);
    dispatch(transactionsActions.setUtxos(data));
  }, [wallet, account]);
}

export function useSafeBalance() {
  const utxos = useUtxos();
  return useMemo(() => {
    const satoshis = utxos.filter((v) => v.inscriptions.length === 0).reduce((pre, cur) => pre + cur.satoshis, 0);
    return satoshisToBTC(satoshis);
  }, [utxos]);
}
