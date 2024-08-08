import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Arc20Balance, Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import {
    useAtomicalsTx,
    useFetchAssetUtxosAtomicalsFTCallback,
    useFetchUtxosCallback,
    usePrepareSendArc20Callback
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { isValidAddress, showLongNumber } from '@/ui/utils';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

export default function SendArc20Screen() {
    const { state } = useLocation();
    const props = state as {
        arc20Balance: Arc20Balance;
    };

    const arc20Balance = props.arc20Balance;

    const navigate = useNavigate();
    const atomicalsTx = useAtomicalsTx();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [toInfo, setToInfo] = useState<{
        address: string;
        domain: string;
        inscription?: Inscription;
    }>({
        address: atomicalsTx.toAddress,
        domain: atomicalsTx.toDomain,
        inscription: undefined
    });

    const [error, setError] = useState('');

    const fetchUtxos = useFetchUtxosCallback();
    const fetchAssetUtxosAtomicalsFT = useFetchAssetUtxosAtomicalsFTCallback();

    const [arc20AvailableBalance, setArc20AvailableBalance] = useState(0);

    const tools = useTools();
    useEffect(() => {
        fetchUtxos();
        tools.showLoading(true);
        fetchAssetUtxosAtomicalsFT(arc20Balance.ticker)
            .then((utxos) => {
                const available = utxos.reduce(
                    (pre, cur) => pre + cur.atomicals.reduce((p, c) => p + (c?.atomicalValue || 0), 0),
                    0
                );
                setArc20AvailableBalance(available);
            })
            .finally(() => {
                tools.showLoading(false);
            });
    }, []);

    const prepareSendArc20 = usePrepareSendArc20Callback();

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

        if (feeRate <= 0) {
            return;
        }

        let dustUtxo = 546;
        try {
            dustUtxo = getAddressUtxoDust(toInfo.address);
        } catch (e) {
            // console.log(e);
        }

        if (parseInt(inputAmount) < dustUtxo) {
            setError(`The minimum amount is ${dustUtxo}`);
            return;
        }

        if (
            toInfo.address == atomicalsTx.toAddress &&
            feeRate == atomicalsTx.feeRate &&
            parseInt(inputAmount) == atomicalsTx.sendArc20Amount
        ) {
            //Prevent repeated triggering caused by setAmount
            setDisabled(false);
            return;
        }

        prepareSendArc20({
            toAddressInfo: toInfo,
            ticker: arc20Balance.ticker,
            amount: parseInt(inputAmount),
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
    }, [toInfo, inputAmount, feeRate, enableRBF]);
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Send ARC-20"
            />
            <Content>
                <Row justifyCenter>
                    <Text
                        text={`${showLongNumber(arc20Balance.balance)} ${arc20Balance.ticker}`}
                        preset="bold"
                        textCenter
                        size="xxl"
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
                        <Row
                            itemsCenter
                            onClick={() => {
                                setInputAmount(arc20AvailableBalance.toString());
                            }}>
                            <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
                            <Text
                                text={`${showLongNumber(arc20AvailableBalance)} ${arc20Balance.ticker}`}
                                preset="bold"
                                size="sm"
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
                    />
                </Column>

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
