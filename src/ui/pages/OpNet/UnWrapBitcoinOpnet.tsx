import { getContract, IWBTCContract, WBTC_ABI } from 'opnet';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account, Inscription, OpNetBalance } from '@/shared/types';
import { expandToDecimals } from '@/shared/utils';
import Web3API, { bigIntToDecimal } from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { Address } from '@btc-vision/transaction';
import { getAddressUtxoDust } from '@btc-vision/wallet-sdk/lib/transaction';

import { useNavigate } from '../MainRoute';

interface ItemData {
    key: string;
    account?: Account;
}

export default function UnWrapBitcoinOpnet() {
    const { state } = useLocation();
    const props = state as {
        OpNetBalance: OpNetBalance;
    };

    const OpNetBalance = props.OpNetBalance;
    const account = useCurrentAccount();
    const wallet = useWallet();
    const navigate = useNavigate();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [OpnetRateInputVal, adjustFeeRateInput] = useState('330');
    const [toInfo, setToInfo] = useState<{
        address: string;
        domain: string;
        inscription?: Inscription;
    }>({
        address: '',
        domain: '',
        inscription: undefined
    });

    const [availableBalance, setAvailableBalance] = useState(0n);
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

    const tools = useTools();
    useEffect(() => {
        const checkAvailableBalance = async () => {
            Web3API.setNetwork(await wallet.getChainType());

            if (!Web3API.WBTC) {
                tools.toastError('Error getting WBTC');
                return;
            }

            const walletAddressPub = Address.fromString(account.pubkey);

            const contract: IWBTCContract = getContract<IWBTCContract>(
                Web3API.WBTC,
                WBTC_ABI,
                Web3API.provider,
                Web3API.network,
                walletAddressPub
            );

            try {
                const checkWithdrawalRequest = await contract.withdrawableBalanceOf(account.address);

                setAvailableBalance(checkWithdrawalRequest.decoded[0] as bigint);
            } catch {
                tools.toastError('Error getting WBTC');
                return;
            }

            //const balance = bigIntToDecimal(checkWithdrawalRequest.decoded[0] as bigint, 8);
            tools.showLoading(false);
        };
        void checkAvailableBalance();
    }, []);

    //const prepareSendRunes = usePrepareSendRunesCallback();

    const [feeRate, setFeeRate] = useState(10);
    const [enableRBF, setEnableRBF] = useState(false);
    const keyring = useCurrentKeyring();
    const items = useMemo(() => {
        const _items: ItemData[] = keyring.accounts.map((v) => {
            return {
                key: v.address,
                account: v
            };
        });
        return _items;
    }, []);

    useEffect(() => {
        setError('');
        setDisabled(true);

        if (!inputAmount) {
            return;
        }

        if (inputAmount != '') {
            //Prevent repeated triggering caused by setAmount
            setDisabled(false);
            return;
        }
    }, [inputAmount, feeRate, enableRBF]);
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={'Unwrap Bitcoin'}
            />
            <Content>
                <Row itemsCenter fullX justifyCenter>
                    {OpNetBalance.logo && <Image src={OpNetBalance.logo} size={fontSizes.tiny} />}
                    <Text
                        text={`${bigIntToDecimal(OpNetBalance.amount, OpNetBalance.divisibility)} ${
                            OpNetBalance.symbol
                        } `}
                        preset="bold"
                        textCenter
                        size="xxl"
                        wrap
                    />
                </Row>
                <Column mt="lg">
                    <Row justifyBetween>
                        <Text text="WBTC Balance (total)" color="textDim" />
                        <Row
                            itemsCenter
                            onClick={() => {
                                setInputAmount(
                                    bigIntToDecimal(OpNetBalance.amount + availableBalance, OpNetBalance.divisibility)
                                );
                            }}>
                            <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
                            <Text
                                text={`${bigIntToDecimal(
                                    OpNetBalance.amount + availableBalance,
                                    OpNetBalance.divisibility
                                )} `}
                                preset="bold"
                                size="sm"
                                wrap
                            />
                        </Row>
                    </Row>
                    <Row justifyBetween>
                        <Text text="Available to Unwrap" color="textDim" />
                        <Row
                            itemsCenter
                            onClick={() => {
                                setInputAmount(bigIntToDecimal(OpNetBalance.amount, OpNetBalance.divisibility));
                            }}>
                            <Text
                                text={`${bigIntToDecimal(
                                    OpNetBalance.amount + availableBalance,
                                    OpNetBalance.divisibility
                                )} `}
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
                        runesDecimal={OpNetBalance.divisibility}
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
                <Text text="Opnet Fee" color="textDim" />
                <Input
                    preset="amount"
                    placeholder={'sat/vB'}
                    value={OpnetRateInputVal}
                    onAmountInputChange={(amount) => {
                        adjustFeeRateInput(amount);
                    }}
                    // onBlur={() => {
                    //   const val = parseInt(feeRateInputVal) + '';
                    //   setFeeRateInputVal(val);
                    // }}
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
                        navigate('TxOpnetConfirmScreen', {
                            rawTxInfo: {
                                items: items,
                                account: account, // replace with actual account
                                inputAmount: inputAmount, // replace with actual inputAmount
                                address: toInfo.address, // replace with actual address
                                feeRate: feeRate, // replace with actual feeRate
                                priorityFee: BigInt(OpnetRateInputVal), // replace with actual OpnetRateInputVal
                                header: 'Unwrap bitcoin', // replace with actual header
                                networkFee: feeRate, // replace with actual networkFee
                                features: {
                                    rbf: false // replace with actual rbf value
                                },
                                inputInfos: [], // replace with actual inputInfos
                                isToSign: false, // replace with actual isToSign value
                                opneTokens: [
                                    {
                                        amount: expandToDecimals(inputAmount, OpNetBalance.divisibility),
                                        divisibility: OpNetBalance.divisibility,
                                        spacedRune: OpNetBalance.name,
                                        symbol: OpNetBalance.symbol
                                    }
                                ],
                                action: 'unwrap' // replace with actual opneTokens
                            }
                        });
                    }}></Button>
            </Content>
        </Layout>
    );
}
