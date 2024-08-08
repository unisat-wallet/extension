import { useCallback, useMemo } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { RawTxInfo, ToAddressInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { satoshisToAmount, satoshisToBTC, sleep, useWallet } from '@/ui/utils';
import { UnspentOutput } from '@unisat/wallet-sdk';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';

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

export function usePrepareSendBTCCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const spendUnavailableUtxos = useSpendUnavailableUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const account = useCurrentAccount();
    const btcUnit = useBTCUnit();
    return useCallback(
        async ({
            toAddressInfo,
            toAmount,
            feeRate,
            enableRBF,
            memo,
            memos,
            disableAutoAdjust
        }: {
            toAddressInfo: ToAddressInfo;
            toAmount: number;
            feeRate?: number;
            enableRBF: boolean;
            memo?: string;
            memos?: string[];
            disableAutoAdjust?: boolean;
        }) => {
            let _utxos: UnspentOutput[] = (
                spendUnavailableUtxos.map((v) => {
                    return Object.assign({}, v, { inscriptions: [], atomicals: [] });
                }) as any
            ).concat(utxos);
            if (_utxos.length === 0) {
                _utxos = await fetchUtxos();
            }
            const safeBalance = _utxos
                .filter((v) => v.inscriptions.length == 0)
                .reduce((pre, cur) => pre + cur.satoshis, 0);
            if (safeBalance < toAmount) {
                throw new Error(
                    `Insufficient balance. Non-Inscription balance(${satoshisToAmount(
                        safeBalance
                    )} ${btcUnit}) is lower than ${satoshisToAmount(toAmount)} ${btcUnit} `
                );
            }

            if (!feeRate) {
                const summary = await wallet.getFeeSummary();
                feeRate = summary.list[1].feeRate;
            }
            let psbtHex = '';

            if (safeBalance === toAmount && !disableAutoAdjust) {
                psbtHex = await wallet.sendAllBTC({
                    to: toAddressInfo.address,
                    btcUtxos: _utxos,
                    enableRBF,
                    feeRate
                });
            } else {
                psbtHex = await wallet.sendBTC({
                    to: toAddressInfo.address,
                    amount: toAmount,
                    btcUtxos: _utxos,
                    enableRBF,
                    feeRate,
                    memo,
                    memos
                });
            }

            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            const fee = account.type === KEYRING_TYPE.KeystoneKeyring ? 0 : psbt.getFee();
            dispatch(
                transactionsActions.updateBitcoinTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    feeRate,
                    enableRBF
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
        [dispatch, wallet, fromAddress, utxos, fetchUtxos, spendUnavailableUtxos]
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

export function usePrepareSendOrdinalsInscriptionCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            toAddressInfo,
            inscriptionId,
            feeRate,
            outputValue,
            enableRBF
        }: {
            toAddressInfo: ToAddressInfo;
            inscriptionId: string;
            feeRate?: number;
            outputValue?: number;
            enableRBF: boolean;
        }) => {
            if (!feeRate) {
                const summary = await wallet.getFeeSummary();
                feeRate = summary.list[1].feeRate;
            }

            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }

            const psbtHex = await wallet.sendOrdinalsInscription({
                to: toAddressInfo.address,
                inscriptionId,
                feeRate,
                outputValue,
                enableRBF,
                btcUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateOrdinalsTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    // inscription,
                    feeRate,
                    outputValue,
                    enableRBF
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

export function usePrepareSendOrdinalsInscriptionsCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const fetchUtxos = useFetchUtxosCallback();
    const utxos = useUtxos();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            toAddressInfo,
            inscriptionIds,
            feeRate,
            enableRBF
        }: {
            toAddressInfo: ToAddressInfo;
            inscriptionIds: string[];
            feeRate?: number;
            enableRBF: boolean;
        }) => {
            if (!feeRate) {
                const summary = await wallet.getFeeSummary();
                feeRate = summary.list[1].feeRate;
            }

            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }
            const psbtHex = await wallet.sendOrdinalsInscriptions({
                to: toAddressInfo.address,
                inscriptionIds,
                feeRate,
                enableRBF,
                btcUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateOrdinalsTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    feeRate,
                    enableRBF
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

export function useCreateSplitTxCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            inscriptionId,
            feeRate,
            outputValue,
            enableRBF
        }: {
            inscriptionId: string;
            feeRate: number;
            outputValue: number;
            enableRBF: boolean;
        }) => {
            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }

            const { psbtHex, splitedCount } = await wallet.splitOrdinalsInscription({
                inscriptionId,
                feeRate,
                outputValue,
                enableRBF,
                btcUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateOrdinalsTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    // inscription,
                    enableRBF,
                    feeRate,
                    outputValue
                })
            );
            const rawTxInfo: RawTxInfo = {
                psbtHex,
                rawtx,
                toAddressInfo: {
                    address: fromAddress
                }
            };
            return { rawTxInfo, splitedCount };
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
        const data = await wallet.getBTCUtxos();
        dispatch(transactionsActions.setUtxos(data));
        return data;
    }, [wallet, account]);
}

export function useSpendUnavailableUtxos() {
    const transactionsState = useTransactionsState();
    return transactionsState.spendUnavailableUtxos;
}

export function useSetSpendUnavailableUtxosCallback() {
    const dispatch = useAppDispatch();
    return useCallback(
        (utxos: UnspentOutput[]) => {
            dispatch(transactionsActions.setSpendUnavailableUtxos(utxos));
        },
        [dispatch]
    );
}

export function useAssetUtxosAtomicalsFT() {
    const transactionsState = useTransactionsState();
    return transactionsState.assetUtxos_atomicals_ft;
}

export function useFetchAssetUtxosAtomicalsFTCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const account = useCurrentAccount();
    return useCallback(
        async (ticker: string) => {
            const data = await wallet.getAssetUtxosAtomicalsFT(ticker);
            dispatch(transactionsActions.setAssetUtxosAtomicalsFT(data));
            return data;
        },
        [wallet, account]
    );
}

export function useSafeBalance() {
    const utxos = useUtxos();
    return useMemo(() => {
        const satoshis = utxos.filter((v) => v.inscriptions.length === 0).reduce((pre, cur) => pre + cur.satoshis, 0);
        return satoshisToBTC(satoshis);
    }, [utxos]);
}

export function usePrepareSendAtomicalsNFTCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            toAddressInfo,
            atomicalId,
            feeRate,
            enableRBF
        }: {
            toAddressInfo: ToAddressInfo;
            atomicalId: string;
            feeRate: number;
            enableRBF: boolean;
        }) => {
            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }

            const psbtHex = await wallet.sendAtomicalsNFT({
                to: toAddressInfo.address,
                atomicalId,
                feeRate,
                enableRBF,
                btcUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateAtomicalsTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    // inscription,
                    feeRate,
                    enableRBF
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

export function usePushAtomicalsTxCallback() {
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
                dispatch(transactionsActions.updateAtomicalsTx({ txid }));

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

export function usePrepareSendArc20Callback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const fetchAssetUtxosAtomicalsFT = useFetchAssetUtxosAtomicalsFTCallback();
    const assetUtxosAtomicalsFT = useAssetUtxosAtomicalsFT();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            toAddressInfo,
            ticker,
            amount,
            feeRate,
            enableRBF
        }: {
            toAddressInfo: ToAddressInfo;
            ticker: string;
            amount: number;
            feeRate: number;
            enableRBF: boolean;
        }) => {
            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }

            let assetUtxos = assetUtxosAtomicalsFT;
            if (assetUtxosAtomicalsFT.length === 0) {
                assetUtxos = await fetchAssetUtxosAtomicalsFT(ticker);
            }

            const availableAmount = assetUtxos.reduce((pre, cur) => pre + cur.satoshis, 0);
            if (availableAmount < amount) {
                throw new Error(
                    `Insufficient balance. Available balance (${availableAmount} ${ticker}) is lower than sending amount(${amount} ${ticker})`
                );
            }
            const psbtHex = await wallet.sendAtomicalsFT({
                to: toAddressInfo.address,
                ticker,
                amount,
                feeRate,
                enableRBF,
                btcUtxos,
                assetUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateAtomicalsTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    feeRate,
                    sendArc20Amount: amount,
                    enableRBF
                })
            );
            const rawTxInfo: RawTxInfo = {
                psbtHex,
                rawtx,
                toAddressInfo
            };
            return rawTxInfo;
        },
        [dispatch, wallet, fromAddress, utxos, assetUtxosAtomicalsFT]
    );
}

export function useAtomicalsTx() {
    const transactionsState = useTransactionsState();
    return transactionsState.atomicalsTx;
}

export function useAssetUtxosRunes() {
    const transactionsState = useTransactionsState();
    return transactionsState.assetUtxos_runes;
}

export function useFetchAssetUtxosRunesCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const account = useCurrentAccount();
    return useCallback(
        async (rune: string) => {
            const data = await wallet.getAssetUtxosRunes(rune);
            dispatch(transactionsActions.setAssetUtxosRunes(data));
            return data;
        },
        [wallet, account]
    );
}

export function usePrepareSendRunesCallback() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const fromAddress = useAccountAddress();
    const utxos = useUtxos();
    const fetchUtxos = useFetchUtxosCallback();
    const assetUtxosRunes = useAssetUtxosRunes();
    const fetchAssetUtxosRunes = useFetchAssetUtxosRunesCallback();
    const account = useCurrentAccount();
    return useCallback(
        async ({
            toAddressInfo,
            runeid,
            runeAmount,
            outputValue,
            feeRate,
            enableRBF
        }: {
            toAddressInfo: ToAddressInfo;
            runeid: string;
            runeAmount: string;
            outputValue?: number;
            feeRate: number;
            enableRBF: boolean;
        }) => {
            if (!feeRate) {
                const summary = await wallet.getFeeSummary();
                feeRate = summary.list[1].feeRate;
            }

            let btcUtxos = utxos;
            if (btcUtxos.length === 0) {
                btcUtxos = await fetchUtxos();
            }

            let assetUtxos = assetUtxosRunes;
            if (assetUtxos.length == 0) {
                assetUtxos = await fetchAssetUtxosRunes(runeid);
            }

            const psbtHex = await wallet.sendRunes({
                to: toAddressInfo.address,
                runeid,
                runeAmount,
                outputValue,
                feeRate,
                enableRBF,
                btcUtxos,
                assetUtxos
            });
            const psbt = bitcoin.Psbt.fromHex(psbtHex);

            const rawtx = account.type === KEYRING_TYPE.KeystoneKeyring ? '' : psbt.extractTransaction().toHex();
            dispatch(
                transactionsActions.updateRunesTx({
                    rawtx,
                    psbtHex,
                    fromAddress,
                    feeRate,
                    enableRBF,
                    runeid,
                    runeAmount,
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
        [dispatch, wallet, fromAddress, utxos, assetUtxosRunes, fetchAssetUtxosRunes, account]
    );
}

export function useRunesTx() {
    const transactionsState = useTransactionsState();
    return transactionsState.runesTx;
}
