import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';
import { useCallback, useEffect, useState } from 'react';

import { Action, Features, MintParameters } from '@/shared/interfaces/RawTxParameters';
import { runesUtils } from '@/shared/lib/runes-utils';
import { OPTokenInfo } from '@/shared/types';
import Web3API, { bigIntToDecimal } from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useLocationState, useWallet } from '@/ui/utils';
import { Wallet } from '@btc-vision/transaction';

import { RouteTypes, useNavigate } from '../MainRoute';

export default function Mint() {
    const props = useLocationState<OPTokenInfo>();

    const navigate = useNavigate();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [OpnetRateInputVal, adjustFeeRateInput] = useState('5000');

    const [error, setError] = useState('');
    const tools = useTools();

    const [feeRate, setFeeRate] = useState(5);
    const [enableRBF, setEnableRBF] = useState(false);
    const wallet = useWallet();
    const [maxSupply, setMaxSupply] = useState<bigint>(0n);

    const [address, setAddress] = useState<string | null>(null);

    const getWallet = useCallback(async () => {
        const currentWalletAddress = await wallet.getCurrentAccount();
        const pubkey = currentWalletAddress.pubkey;

        const wifWallet = await wallet.getInternalPrivateKey({
            pubkey: pubkey,
            type: currentWalletAddress.type
        });

        return Wallet.fromWif(wifWallet.wif, Web3API.network);
    }, [wallet]);

    const cb = useCallback(async () => {
        const wallet = await getWallet();

        setAddress(wallet.address.toString());
        setDisabled(false);
        setError('');
    }, [getWallet]);

    useEffect(() => {
        setDisabled(true);

        if (!inputAmount) {
            setError('Please enter an amount');

            return;
        }

        cb();
    }, [inputAmount, cb]);

    useEffect(() => {
        const setWallet = async () => {
            Web3API.setNetwork(await wallet.getChainType());
            const contract: IOP_20Contract = getContract<IOP_20Contract>(
                props.address,
                OP_20_ABI,
                Web3API.provider,
                Web3API.network
            );

            try {
                const maxSupply = await contract.maximumSupply();
                const totalSupply = await contract.totalSupply();

                setMaxSupply(maxSupply.properties.maximumSupply - totalSupply.properties.totalSupply);
            } catch (e) {
                setError(`Error fetching supply: ${e}`);

                tools.toastError(`Error fetching supply: ${e}`);
                return;
            }
        };

        void setWallet();
    }, [props.address, tools, wallet]);

    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={'Mint ' + props.name}
            />
            <Content>
                <Row itemsCenter fullX justifyCenter>
                    {props.logo && <img src={props.logo} style={{ width: fontSizes.tiny, height: fontSizes.tiny }} />}
                    <Text
                        text={`${runesUtils.toDecimalAmount(props.amount.toString(), props.divisibility)} ${
                            props.symbol
                        } `}
                        preset="bold"
                        textCenter
                        size="xxl"
                        wrap
                    />
                </Row>

                <Column mt="lg">
                    <Row justifyBetween>
                        <Text text="Amount" color="textDim" />
                        <Row
                            itemsCenter
                            onClick={() => {
                                setInputAmount(runesUtils.toDecimalAmount(maxSupply.toString(), props.divisibility));
                            }}>
                            <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
                            <Text
                                text={`${runesUtils.toDecimalAmount(maxSupply.toString(), props.divisibility)} `}
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
                            const numAmount = Number(amount);
                            const maxSupplyParsed = bigIntToDecimal(maxSupply, props.divisibility);

                            if (numAmount <= Number(maxSupplyParsed)) {
                                setInputAmount(amount);
                            } else {
                                setInputAmount(runesUtils.toDecimalAmount(maxSupply.toString(), props.divisibility));
                            }
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
                <Text text="Priority Fee" color="textDim" />
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
                        if (!address) {
                            return;
                        }

                        const txInfo: MintParameters = {
                            contractAddress: props.address,
                            to: address,
                            inputAmount: Number(inputAmount),
                            header: 'Mint Token',
                            features: {
                                [Features.rbf]: true
                            },
                            tokens: [props],
                            feeRate: feeRate,
                            priorityFee: BigInt(OpnetRateInputVal),
                            action: Action.Mint
                        };

                        console.log(txInfo);

                        navigate(RouteTypes.TxOpnetConfirmScreen, {
                            rawTxInfo: txInfo
                        });
                    }}></Button>
            </Content>
        </Layout>
    );
}
