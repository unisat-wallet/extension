import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Inscription, RawTxInfo, RuneBalance, RuneInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { TickUsdWithoutPrice } from '@/ui/components/TickUsd';
import { useNavigate } from '@/ui/pages/MainRoute';
import {
    useFetchAssetUtxosRunesCallback,
    useFetchUtxosCallback,
    usePrepareSendRunesCallback,
    useRunesTx
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { isValidAddress, showLongNumber } from '@/ui/utils';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

export default function SendRunesScreen() {
    const { state } = useLocation();
    const props = state as {
        runeBalance: RuneBalance;
        runeInfo: RuneInfo;
    };

    const runeBalance = props.runeBalance;

    const runeInfo = props.runeInfo;

    const navigate = useNavigate();
    const runesTx = useRunesTx();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [toInfo, setToInfo] = useState<{
        address: string;
        domain: string;
        inscription?: Inscription;
    }>({
        address: runesTx.toAddress,
        domain: runesTx.toDomain,
        inscription: undefined
    });

    const [availableBalance, setAvailableBalance] = useState('0');
    const [error, setError] = useState('');

    const defaultOutputValue = 546;

    const [outputValue, setOutputValue] = useState(defaultOutputValue);
    const minOutputValue = useMemo(() => {
        if (toInfo.address) {
            return getAddressUtxoDust(toInfo.address);
        } else {
            return 0;
        }
    }, [toInfo.address]);

    const fetchUtxos = useFetchUtxosCallback();

    const fetchAssetUtxosRunes = useFetchAssetUtxosRunesCallback();
    const tools = useTools();
    useEffect(() => {
        fetchUtxos();
        tools.showLoading(true);
        fetchAssetUtxosRunes(runeInfo.runeid)
            .then((utxos) => {
                let balance = new BigNumber(0);
                for (let i = 0; i < utxos.length; i++) {
                    const utxo = utxos[i];
                    if (utxo.runes) {
                        utxo.runes.forEach((rune) => {
                            if (rune.runeid === runeInfo.runeid) {
                                balance = balance.plus(new BigNumber(rune.amount));
                            }
                        });
                    }
                }
                setAvailableBalance(balance.toString());
            })
            .finally(() => {
                tools.showLoading(false);
            });
    }, []);

    const prepareSendRunes = usePrepareSendRunesCallback();

    const [feeRate, setFeeRate] = useState(5);
    const [enableRBF, setEnableRBF] = useState(false);

    const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
    useEffect(() => {
        setError('');
        setDisabled(true);

        if (!isValidAddress(toInfo.address)) {
            return;
        }
        if (!inputAmount) {
            return;
        }

        const runeAmount = runesUtils.fromDecimalAmount(inputAmount, runeInfo.divisibility);
        if (feeRate <= 0) {
            return;
        }

        let dustUtxo = 546;
        try {
            dustUtxo = getAddressUtxoDust(toInfo.address);
        } catch (e) {
            // console.log(e);
        }

        const minOutputValue = dustUtxo;

        if (outputValue < minOutputValue) {
            setError(`OutputValue must be at least ${minOutputValue}`);
            return;
        }

        if (!outputValue) {
            return;
        }

        if (
            toInfo.address == runesTx.toAddress &&
            runeAmount == runesTx.runeAmount &&
            feeRate == runesTx.feeRate &&
            outputValue == runesTx.outputValue &&
            enableRBF == runesTx.enableRBF
        ) {
            //Prevent repeated triggering caused by setAmount
            setDisabled(false);
            return;
        }

        prepareSendRunes({
            toAddressInfo: toInfo,
            runeid: runeInfo.runeid,
            runeAmount: runeAmount,
            outputValue: outputValue,
            feeRate,
            enableRBF
        })
            .then((data) => {
                // if (data.fee < data.estimateFee) {
                //   setError(`Network fee must be at leat ${data.estimateFee}`);
                //   return;
                // }
                setRawTxInfo(data);
                setDisabled(false);
            })
            .catch((e) => {
                console.log(e);
                setError(e.message);
            });
    }, [toInfo, inputAmount, feeRate, enableRBF, outputValue]);
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Send Runes"
            />
            <Content>
                <Row justifyCenter>
                    <Text
                        text={`${showLongNumber(
                            runesUtils.toDecimalAmount(runeBalance.amount, runeBalance.divisibility)
                        )} ${runeInfo.symbol}`}
                        preset="bold"
                        textCenter
                        size="xxl"
                        wrap
                    />
                </Row>
                <Row justifyCenter fullX style={{ marginTop: -12, marginBottom: -12 }}>
                    <TickUsdWithoutPrice
                        tick={runeInfo.spacedRune}
                        balance={runesUtils.toDecimalAmount(runeBalance.amount, runeBalance.divisibility)}
                        type={'runes'}
                        size={'md'}
                    />
                </Row>

                <Column mt="lg">
                    <Text text="Recipient" preset="regular" color="textDim" />
                    <Input
                        preset="address"
                        addressInputData={toInfo}
                        onAddressInputChange={(val) => {
                            setToInfo(val);
                        }}
                        autoFocus={true}
                    />
                </Column>

                <Column mt="lg">
                    <Row justifyBetween>
                        <Text text="Balance" color="textDim" />
                        <TickUsdWithoutPrice tick={runeInfo.spacedRune} balance={inputAmount} type={'runes'} />
                        <Row
                            itemsCenter
                            onClick={() => {
                                setInputAmount(runesUtils.toDecimalAmount(availableBalance, runeBalance.divisibility));
                            }}>
                            <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
                            <Text
                                text={`${showLongNumber(
                                    runesUtils.toDecimalAmount(availableBalance, runeBalance.divisibility)
                                )} ${runeInfo.symbol}`}
                                preset="bold"
                                size="sm"
                                wrap
                            />
                        </Row>
                    </Row>
                    <Input
                        preset="amount"
                        placeholder={'Amount'}
                        value={inputAmount.toString()}
                        onAmountInputChange={(amount) => {
                            setInputAmount(amount);
                        }}
                        runesDecimal={runeInfo.divisibility}
                    />
                </Column>

                {toInfo.address ? (
                    <Column mt="lg">
                        <Text text="OutputValue" color="textDim" />

                        <OutputValueBar
                            defaultValue={defaultOutputValue}
                            minValue={minOutputValue}
                            onChange={(val) => {
                                setOutputValue(val);
                            }}
                        />
                    </Column>
                ) : null}

                <Column mt="lg">
                    <Text text="Fee" color="textDim" />

                    <FeeRateBar
                        onChange={(val) => {
                            setFeeRate(val);
                        }}
                    />
                </Column>

                <Column mt="lg">
                    <RBFBar
                        onChange={(val) => {
                            setEnableRBF(val);
                        }}
                    />
                </Column>

                {error && <Text text={error} color="error" />}

                <Button
                    disabled={disabled}
                    preset="primary"
                    text="Next"
                    onClick={(e) => {
                        navigate('TxConfirmScreen', { rawTxInfo });
                    }}></Button>
            </Content>
        </Layout>
    );
}
