import { Psbt } from 'bitcoinjs-lib';
import { useCallback, useMemo } from 'react';

import { Inscription } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
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
    async (
      addressInfo: { address: string; domain: string },
      toAmount: number,
      feeRate?: number,
      receiverToPayFee = false
    ) => {
      let _utxos = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }
      const psbtHex = await wallet.sendBTC({
        to: addressInfo.address,
        amount: toAmount,
        utxos: _utxos,
        receiverToPayFee,
        feeRate
      });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx,
          psbtHex,
          fromAddress,
          toAddress: addressInfo.address,
          toDomain: addressInfo.domain,
          feeRate
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
  const tools = useTools();
  return useCallback(async () => {
    let success = false;
    try {
      tools.showLoading(true);
      const txid = await wallet.pushTx(bitcoinTx.rawtx);
      await sleep(3); // Wait for transaction synchronization
      tools.showLoading(false);
      dispatch(transactionsActions.updateBitcoinTx({ txid }));
      dispatch(accountActions.expireBalance());
      setTimeout(() => {
        dispatch(accountActions.expireBalance());
      }, 2000);
      setTimeout(() => {
        dispatch(accountActions.expireBalance());
      }, 5000);
      success = true;
    } catch (e) {
      console.log(e);
      tools.showLoading(false);
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
    async (
      toInfo: { address: string; domain: string },
      inscription: Inscription,
      feeRate: number,
      outputValue: number
    ) => {
      let _utxos = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      const psbtHex = await wallet.sendInscription({
        to: toInfo.address,
        inscriptionId: inscription.id,
        utxos: _utxos,
        feeRate,
        outputValue
      });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx,
          psbtHex,
          fromAddress,
          toAddress: toInfo.address,
          toDomain: toInfo.domain,
          inscription,
          feeRate,
          outputValue
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
  const tools = useTools();
  return useCallback(async () => {
    let success = false;
    try {
      tools.showLoading(true);
      const txid = await wallet.pushTx(ordinalsTx.rawtx);
      await sleep(3); // Wait for transaction synchronization
      tools.showLoading(false);
      dispatch(transactionsActions.updateOrdinalsTx({ txid }));

      dispatch(accountActions.expireBalance());
      setTimeout(() => {
        dispatch(accountActions.expireBalance());
      }, 2000);
      setTimeout(() => {
        dispatch(accountActions.expireBalance());
      }, 5000);

      success = true;
    } catch (e) {
      console.log(e);
      tools.showLoading(false);
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
