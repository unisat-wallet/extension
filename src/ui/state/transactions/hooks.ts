import { Psbt } from 'bitcoinjs-lib';
import { useCallback, useMemo } from 'react';

import { RawTxInfo, ToAddressInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { satoshisToAmount, satoshisToBTC, sleep, useWallet } from '@/ui/utils';

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
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, toAmount: number, feeRate?: number, receiverToPayFee = false) => {
      let _utxos = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      const safeBalance = _utxos.filter((v) => v.inscriptions.length == 0).reduce((pre, cur) => pre + cur.satoshis, 0);
      if (safeBalance < toAmount) {
        throw new Error(
          `Insufficient balance. Non-Inscription balance(${satoshisToAmount(
            safeBalance
          )} BTC) is lower than ${satoshisToAmount(toAmount)} BTC `
        );
      }

      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }
      const psbtHex = await wallet.sendBTC({
        to: toAddressInfo.address,
        amount: toAmount,
        utxos: _utxos,
        receiverToPayFee,
        feeRate
      });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      const fee = psbt.getFee();
      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx,
          psbtHex,
          fromAddress,
          feeRate
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex,
        rawtx,
        toAddressInfo,
        fee
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos, fetchUtxos]
  );
}

export function usePushBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        tools.showLoading(true);
        const txid = await wallet.pushTx(rawtx);
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

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        ret.error = (e as Error).message;
        tools.showLoading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}

export function useOrdinalsTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.ordinalsTx;
}

export function useCreateOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, inscriptionId: string, feeRate: number, outputValue: number) => {
      const psbtHex = await wallet.sendInscription({
        to: toAddressInfo.address,
        inscriptionId,
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
          // inscription,
          feeRate,
          outputValue
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex,
        rawtx,
        toAddressInfo
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos]
  );
}

export function useCreateMultiOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  return useCallback(
    async (toAddressInfo: ToAddressInfo, inscriptionIds: string[], feeRate?: number) => {
      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }
      const psbtHex = await wallet.sendInscriptions({
        to: toAddressInfo.address,
        inscriptionIds,
        feeRate
      });
      const psbt = Psbt.fromHex(psbtHex);
      const rawtx = psbt.extractTransaction().toHex();
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx,
          psbtHex,
          fromAddress,
          feeRate
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex,
        rawtx,
        toAddressInfo
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos]
  );
}

export function usePushOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        tools.showLoading(true);
        const txid = await wallet.pushTx(rawtx);
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

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        console.log(e);
        ret.error = (e as Error).message;
        tools.showLoading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
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
