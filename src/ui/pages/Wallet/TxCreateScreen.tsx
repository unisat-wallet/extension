import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { ChainType, COIN_DUST } from '@/shared/constant';
import { Action, Features, SendBitcoinParameters } from '@/shared/interfaces/RawTxParameters';
import Web3API, { bigIntToDecimal } from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { RouteTypes, useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { amountToSatoshis, isValidAddress, satoshisToAmount, useWallet } from '@/ui/utils';

BigNumber.config({ EXPONENTIAL_AT: 256 });

export default function TxCreateScreen() {
    const navigate = useNavigate();
    const btcUnit = useBTCUnit();

    const [disabled, setDisabled] = useState(true);

    const setUiState = useUpdateUiTxCreateScreen();
    const uiState = useUiTxCreateScreen();

    const toInfo = uiState.toInfo;
    const inputAmount = uiState.inputAmount;
    const enableRBF = uiState.enableRBF;
    const feeRate = uiState.feeRate;

    const [error, setError] = useState('');
    const [totalAvailableAmount, setBalanceValue] = useState<number>(0);
    const [OpnetRateInputVal, setOpnetRateInputVal] = useState<string>('0');
    const [autoAdjust, setAutoAdjust] = useState(false);

    const account = useCurrentAccount();
    const _currentBalance = Web3API.getBalance(account.address, true);
    const [currentBalance, setCurrentBalance] = useState(0n);

    const tools = useTools();
    useEffect(() => {
        tools.showLoading(true);
        void _currentBalance.then((balance: bigint) => {
            tools.showLoading(false);

            setCurrentBalance(balance);
        });
    }, []);

    const toSatoshis = useMemo(() => {
        if (!inputAmount) return 0;
        return amountToSatoshis(inputAmount);
    }, [inputAmount]);

    const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);

    const wallet = useWallet();
    const chain = useChain();

    useEffect(() => {
        const fetchBalance = async () => {
            const btcBalanceGet = await Web3API.getBalance(account.address, true);
            setBalanceValue(new BigNumber(bigIntToDecimal(btcBalanceGet, 8)).toNumber());
        };

        void fetchBalance();
    }, [chain.enum, account.address]);

    useEffect(() => {
        const setWallet = async () => {
            Web3API.setNetwork(await wallet.getChainType());
        };
        void setWallet();
    });

    useEffect(() => {
        setError('');
        setDisabled(true);

        if (!isValidAddress(toInfo.address)) {
            return;
        }

        if (!toSatoshis) {
            return;
        }

        if (toSatoshis < COIN_DUST) {
            setError(`Amount must be at least ${dustAmount} ${btcUnit}`);
            return;
        }

        if (toSatoshis / 10 ** 8 > totalAvailableAmount) {
            setError('Amount exceeds your available balance');
            return;
        }

        if (feeRate <= 0) {
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
                title={`Send ${btcUnit}`}
            />
            <Content style={{ padding: '0px 16px 24px' }}>
                <Row justifyCenter>
                    <Image src={chain.icon} size={50} />
                </Row>

                <Column mt="lg">
                    <Text text="Recipient" preset="regular" color="textDim" />
                    <Input
                        preset="address"
                        addressInputData={toInfo}
                        onAddressInputChange={(val) => {
                            setUiState({ toInfo: val });
                        }}
                        autoFocus={true}
                    />
                </Column>

                <Column mt="lg">
                    <Row justifyBetween>
                        <Text text="Transfer amount" preset="regular" color="textDim" />
                        <BtcUsd sats={toSatoshis} />
                    </Row>
                    <Input
                        preset="amount"
                        placeholder={'Amount'}
                        value={inputAmount}
                        onAmountInputChange={(amount) => {
                            if (autoAdjust) {
                                setAutoAdjust(false);
                            }
                            setUiState({ inputAmount: amount });
                        }}
                        enableMax={true}
                        onMaxClick={() => {
                            setAutoAdjust(true);
                            setUiState({
                                inputAmount: totalAvailableAmount.toString()
                            });
                        }}
                    />

                    <Row justifyBetween>
                        <Text text="Available" color="gold" />
                        {chain.enum === ChainType.BITCOIN_REGTEST ? (
                            <>
                                {' '}
                                <Row>
                                    <Text text={`${totalAvailableAmount}`} size="sm" color="gold" />
                                    <Text text={btcUnit} size="sm" color="textDim" />
                                </Row>
                            </>
                        ) : (
                            <>
                                {' '}
                                <Row>
                                    <Text text={`${totalAvailableAmount}`} size="sm" style={{ color: '#65D5F0' }} />
                                    <Text text={btcUnit} size="sm" color="textDim" />
                                    <Text text={'+'} size="sm" color="textDim" />
                                </Row>
                                <Row>
                                    <Text text={`${currentBalance}`} size="sm" color="gold" />
                                    <Text text={btcUnit} size="sm" color="textDim" />
                                </Row>
                            </>
                        )}
                    </Row>

                    <Row justifyBetween>
                        <Text text="Total" color="textDim" />
                        <Row>
                            <Text text={`${totalAvailableAmount}`} size="sm" color="textDim" />
                            <Text text={btcUnit} size="sm" color="textDim" />
                        </Row>
                    </Row>
                </Column>

                <Column mt="lg">
                    <Text text="Fee" color="textDim" />

                    <FeeRateBar
                        onChange={(val) => {
                            setUiState({ feeRate: val });
                        }}
                    />
                </Column>

                <Text text="Opnet Fee" color="textDim" />
                <Input
                    preset="amount"
                    placeholder={'sat/vB'}
                    value={OpnetRateInputVal}
                    onAmountInputChange={(amount) => {
                        setOpnetRateInputVal(amount);
                    }}
                    autoFocus={true}
                />

                <Column mt="lg">
                    <RBFBar
                        defaultValue={enableRBF}
                        onChange={(val) => {
                            setUiState({ enableRBF: val });
                        }}
                    />
                </Column>

                {error && <Text text={error} color="error" />}

                <Button
                    disabled={disabled}
                    preset="primary"
                    text="Next"
                    onClick={() => {
                        const event: SendBitcoinParameters = {
                            to: toInfo.address,
                            inputAmount: parseFloat(inputAmount),

                            feeRate: feeRate,
                            features: {
                                [Features.rbf]: true
                            },
                            priorityFee: 0n,
                            header: `Send ${btcUnit}`,
                            tokens: [],
                            action: Action.SendBitcoin
                        };

                        navigate(RouteTypes.TxOpnetConfirmScreen, {
                            rawTxInfo: event
                        });
                    }}></Button>
            </Content>
        </Layout>
    );
}
