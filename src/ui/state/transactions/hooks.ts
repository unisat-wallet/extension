import { Psbt } from 'bitcoinjs-lib';
import { useCallback, useMemo } from 'react';

import { Inscription } from '@/shared/types';
import { satoshisToBTC, sleep, useWallet } from '@/ui/utils';

import { AppState } from '..';
import { useAccountAddress, useCurrentAccount } from '../accounts/hooks';
import { accountActions } from '../accounts/reducer';
import { useAppDispatch, useAppSelector } from '../hooks';
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
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  return useCallback(
    async (toAddress: string, toAmount: number, autoAdjust = false) => {
      let _utxos = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      const psbtHex = await wallet.sendBTC({ to: toAddress, amount: toAmount, utxos: _utxos, autoAdjust });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx,
          psbtHex,
          fromAddress,
          toAddress
        })
      );
      return psbtHex;
    },
    [dispatch, bitcoinTx, wallet, fromAddress, utxos, fetchUtxos]
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
      await sleep(3); // Wait for transaction synchronization
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
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  return useCallback(
    async (toAddress: string, inscription: Inscription) => {
      let _utxos = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      const psbtHex = await wallet.sendInscription({ to: toAddress, inscriptionId: inscription.id, utxos: _utxos });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx,
          psbtHex,
          fromAddress,
          toAddress,
          inscription
        })
      );
      return psbtHex;
    },
    [dispatch, ordinalsTx, wallet, fromAddress, utxos]
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
      await sleep(3); // Wait for transaction synchronization
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
    return data;
  }, [wallet, account]);
}

export function useSafeBalance() {
  const utxos = useUtxos();
  return useMemo(() => {
    const satoshis = utxos.filter((v) => v.inscriptions.length === 0).reduce((pre, cur) => pre + cur.satoshis, 0);
    return satoshisToBTC(satoshis);
  }, [utxos]);
}
