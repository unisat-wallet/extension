import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import { Action, TransferParameters } from '@/shared/interfaces/RawTxParameters';
import { runesUtils } from '@/shared/lib/runes-utils';
import { OPTokenInfo } from '@/shared/types';
import { bigIntToDecimal } from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

import { useLocationState } from '@/ui/utils';
import { RouteTypes, useNavigate } from '../MainRoute';

BigNumber.config({ EXPONENTIAL_AT: 256 });

export default function SendOpNetScreen() {
    const props = useLocationState<OPTokenInfo>();

    const navigate = useNavigate();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [OpnetRateInputVal, adjustFeeRateInput] = useState('5000');
    const [toInfo, setToInfo] = useState<{
        address: string;
        domain: string;
    }>({
        address: '',
        domain: ''
    });

    const [error, setError] = useState('');
    const [availableBalance, setAvailableBalance] = useState('');

    const tools = useTools();
    useEffect(() => {
        const balance = bigIntToDecimal(props.amount, props.divisibility);
        setAvailableBalance(balance.toString());

        tools.showLoading(false);
    }, []);

    const [feeRate, setFeeRate] = useState(5);
    const [enableRBF, setEnableRBF] = useState(false);

    useEffect(() => {
        setError('');
        setDisabled(true);

        const amount = parseFloat(inputAmount);
        if (!amount || amount <= 0) {
            setError('Invalid amount');
            return;
        }

        if (amount > parseFloat(availableBalance)) {
            setError('Insufficient balance');
            return;
        }

        if (!toInfo.address) {
            setError('Invalid recipient');
            return;
        }

        setDisabled(false);
    }, [toInfo, inputAmount, feeRate, enableRBF]);

    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={'Send ' + props.name}
            />
            <Content>
                <Row itemsCenter fullX justifyCenter>
                    {props.logo && <Image src={props.logo} size={fontSizes.tiny} />}
                    <Text
                        text={`${Number(
                            runesUtils.toDecimalAmount(props.amount.toString(), props.divisibility)
                        ).toFixed(8)} ${props.symbol} `}
                        preset="bold"
                        textCenter
                        size="xxl"
                        wrap
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
                                setInputAmount(runesUtils.toDecimalAmount(props.amount.toString(), props.divisibility));
                            }}>
                            <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
                            <Text
                                text={`${Number(
                                    runesUtils.toDecimalAmount(props.amount.toString(), props.divisibility)
                                ).toFixed(8)} ${props.symbol} `}
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
                        runesDecimal={props.divisibility}
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
                <Text text="Opnet Fee" color="textDim" />
                <Input
                    preset="amount"
                    placeholder={'sat/vB'}
                    value={OpnetRateInputVal}
                    onAmountInputChange={(amount) => {
                        adjustFeeRateInput(amount);
                    }}
                    autoFocus={true}
                />
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
                    onClick={() => {
                        const sendTransfer: TransferParameters = {
                            action: Action.Transfer,
                            contractAddress: props.address,
                            to: toInfo.address,
                            inputAmount: parseFloat(inputAmount),
                            feeRate: feeRate,
                            priorityFee: BigInt(OpnetRateInputVal),
                            tokens: [props],
                            header: `Send ${props.symbol}`,
                            features: {
                                rbf: enableRBF
                            }
                        };

                        navigate(RouteTypes.TxOpnetConfirmScreen, {
                            rawTxInfo: sendTransfer
                        });
                    }}></Button>
            </Content>
        </Layout>
    );
}
