import BigNumber from 'bignumber.js';
import {
    BitcoinUtils,
    getContract,
    IMotoswapRouterContract,
    IOP_20Contract,
    MOTOSWAP_ROUTER_ABI,
    OP_20_ABI
} from 'opnet';
import { AddressesInfo } from 'opnet/src/providers/interfaces/PublicKeyInfo';
import { CSSProperties, useMemo, useState } from 'react';

import { Account, OPTokenInfo } from '@/shared/types';
import { expandToDecimals } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Input, Layout, Row, Select, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';
import { Address } from '@btc-vision/transaction';

import { RouteTypes, useNavigate } from '../MainRoute';

interface ItemData {
    key: string;
    account?: Account;
}

BigNumber.config({ EXPONENTIAL_AT: 256 });

export default function Swap() {
    //const { state } = useLocation();
    //const props = state satisfies {
    //     OpNetBalance: OPTokenInfo;
    //};

    //const OpNetBalance = props.OpNetBalance;

    const [loading, setLoading] = useState(true);
    const [switchOptions, setSwitchOptions] = useState<OPTokenInfo[]>([]);
    const [selectedOption, setSelectedOption] = useState<OPTokenInfo | null>(null);
    const [selectedOptionOutput, setSelectedOptioOutput] = useState<OPTokenInfo | null>(null);

    const [OpnetRateInputVal, adjustFeeRateInput] = useState<string>('8600');
    const [slippageTolerance, setSlippageTolerance] = useState<string>('5');
    const navigate = useNavigate();
    const [feeRate, setFeeRate] = useState(5);
    const [inputAmount, setInputAmount] = useState<string>('0');
    const [outputAmount, setOutPutAmount] = useState<string>('0');
    const keyring = useCurrentKeyring();

    const wallet = useWallet();
    const currentAccount = useCurrentAccount();
    const tools = useTools();

    const items = useMemo(() => {
        const _items: ItemData[] = keyring.accounts.map((v) => {
            return {
                key: v.address,
                account: v
            };
        });
        return _items;
    }, []);

    const handleSelect = async (option: OPTokenInfo) => {
        if (option.address == selectedOptionOutput?.address) {
            tools.toastError("Token In and Token Out can't be the same");
            return;
        }
        await handleInputChange(inputAmount);
        setSelectedOption(option);
    };

    const handleSelectOutput = async (option: OPTokenInfo) => {
        if (option.address == selectedOption?.address) {
            tools.toastError("Token In and Token Out can't be the same");
            return;
        }

        await handleInputChange(inputAmount);
        setSelectedOptioOutput(option);
    };

    const setMax = () => {
        if (selectedOption) {
            const maxBalance = new BigNumber(selectedOption.amount.toString()).dividedBy(
                new BigNumber(10).pow(selectedOption.divisibility)
            );
            setInputAmount(maxBalance.toString());
        }
    };

    const handleInputChange = async (value: string) => {
        // Allow empty input, numbers, and one decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            if (selectedOption && selectedOptionOutput) {
                const maxBalance = new BigNumber(selectedOption.amount.toString()).dividedBy(
                    new BigNumber(10).pow(selectedOption.divisibility)
                );

                // If the input is not empty and is a valid number
                if (value !== '' && value !== '.') {
                    const numericValue = new BigNumber(value);
                    if (numericValue.lt(maxBalance)) {
                        setInputAmount(value.toString());
                    } else {
                        setInputAmount(maxBalance.toString());
                    }

                    if (!Web3API.ROUTER_ADDRESS) {
                        tools.toastError('Router address not found');
                        return;
                    }

                    const getQuote: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
                        Web3API.ROUTER_ADDRESS,
                        MOTOSWAP_ROUTER_ABI,
                        Web3API.provider,
                        Web3API.network
                    );

                    try {
                        const pubKeyInfoSelectedOption = await Web3API.provider.getPublicKeysInfo([
                            selectedOption.address,
                            selectedOptionOutput.address
                        ]) as AddressesInfo;

                        const originalPubKeyInput: Address = pubKeyInfoSelectedOption[selectedOption.address];
                        const originalPubKeyOutput: Address = pubKeyInfoSelectedOption[selectedOptionOutput.address];

                        const getData = await getQuote.getAmountsOut(
                            BigInt(Number(numericValue) * Math.pow(10, selectedOption.divisibility)),
                            [originalPubKeyInput, originalPubKeyOutput]
                        );

                        setOutPutAmount(
                            BitcoinUtils.formatUnits(
                                // TODO (typing): Check this again if accessing the first index is correct. 
                                getData.properties.amountsOut[1],
                                selectedOptionOutput.divisibility
                            )
                        );
                    } catch (e) {
                        console.log('Error fetching data:', e);
                        return;
                    }
                } else {
                    // Allow empty input or just a decimal point
                    setInputAmount(value);
                }
            } else {
                // If no option is selected, just set the input value
                setInputAmount(value);
            }
        }
    };

    const $searchInputStyle = {
        width: '40%',
        padding: 8,
        fontSize: fontSizes.md,
        border: 'none',
        borderRadius: 0,
        outline: 'none',
        height: '42px',
        backgroundColor: '#2a2626'

        // color: colors.text
    } as CSSProperties;

    const $styleBox = {
        width: '100%',
        maxWidth: '350px',
        marginRight: 'auto',
        marginLeft: 'auto',
        backgroundColor: '#2a2626',
        borderRadius: '10px',
        border: 'solid 1px white',
        padding: '20px'
    } as CSSProperties;

    const $columnstyle = {
        padding: '20px'
    } as CSSProperties;

    const $styleButton = {
        width: '100%',
        maxWidth: '350px',
        marginRight: 'auto',
        marginLeft: 'auto'
    } as CSSProperties;

    const $style = Object.assign({}, $styleBox);

    useState(() => {
        const getData = async () => {
            Web3API.setNetwork(await wallet.getChainType());

            const getChain = await wallet.getChainType();
            const tokensImported = localStorage.getItem('opnetTokens_' + getChain);
            const parsedTokens = tokensImported ? JSON.parse(tokensImported) as string[] : [];
            //if (OpNetBalance?.address) {
            //    setSelectedOption(OpNetBalance);
            //}

            const tokenBalances: OPTokenInfo[] = [];
            for (let i = 0; i < parsedTokens.length; i++) {
                try {
                    const tokenAddress = parsedTokens[i];
                    const provider = Web3API.provider;
                    const contract: IOP_20Contract = getContract<IOP_20Contract>(
                        tokenAddress,
                        OP_20_ABI,
                        provider,
                        Web3API.network
                    );

                    const contractInfo: ContractInformation | undefined =
                        await Web3API.queryContractInformation(tokenAddress);

                    const walletAddressPub = Address.fromString(currentAccount.pubkey);

                    const balance = await contract.balanceOf(walletAddressPub);
                    tokenBalances.push({
                        address: tokenAddress,
                        name: contractInfo?.name ?? '',
                        amount: balance.properties.balance,
                        divisibility: contractInfo?.decimals ?? 8,
                        symbol: contractInfo?.symbol ?? '',
                        logo: contractInfo?.logo
                    });
                } catch (e) {
                    console.log(`Error processing token at index ${i}:`, e);
                }
            }
            setSwitchOptions(tokenBalances);

            setLoading(false);
        };

        void getData();
    });

    if (loading) {
        return (
            <Layout>
                <Content itemsCenter justifyCenter>
                    <Icon size={fontSizes.xxxl} color="gold">
                        <LoadingOutlined />
                    </Icon>
                </Content>
            </Layout>
        );
    }
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
            />
            <Column py="xl" style={$columnstyle}>
                <BaseView style={$style}>
                    <Row itemsCenter fullX justifyBetween style={{ alignItems: 'baseline' }}>
                        <Select
                            selectIndex={0}
                            setMax={() => setMax()}
                            options={switchOptions}
                            selectedoptionuse={selectedOption}
                            placeholder={'Select Token'}
                            onSelect={handleSelect}
                        />
                        <input
                            type="text"
                            placeholder="0"
                            value={inputAmount}
                            onChange={(e) => handleInputChange(e.target.value)}
                            style={$searchInputStyle}
                        />
                    </Row>
                    <hr style={{ width: 'calc(100% + 37px)', marginLeft: '-20px' }} />
                    <br />
                    <Row itemsCenter fullX justifyBetween style={{ alignItems: 'baseline' }}>
                        <Select
                            selectIndex={1}
                            options={switchOptions}
                            placeholder={'Select Token'}
                            onSelect={handleSelectOutput}
                        />
                        <input
                            disabled
                            type="text"
                            placeholder="0"
                            value={Number(outputAmount)}
                            onChange={(e) => handleInputChange(e.target.value)}
                            style={$searchInputStyle}
                        />
                    </Row>
                </BaseView>
                <br />
                <BaseView style={$style}>
                    <Text text="Slippage Tolerance" color="textDim" />
                    <Input
                        preset="amount"
                        placeholder={'5%'}
                        value={slippageTolerance}
                        onAmountInputChange={(value) => {
                            const numValue = Number(value);
                            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                setSlippageTolerance(value.toString());
                            }
                        }}
                        autoFocus={true}
                    />

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
                    <Text text="Fee" color="textDim" />

                    <FeeRateBar
                        onChange={(val) => {
                            setFeeRate(val);
                        }}
                    />
                </BaseView>
                <br />
                <Button
                    text="Swap "
                    preset="primary"
                    icon="swap"
                    style={$styleButton}
                    onClick={() => {
                        navigate(RouteTypes.TxOpnetConfirmScreen, {
                            rawTxInfo: {
                                items: items,
                                contractAddress: [selectedOption?.address, selectedOptionOutput?.address],
                                account: currentAccount, // replace with actual account
                                inputAmount: [inputAmount, outputAmount], // replace with actual inputAmount
                                address: selectedOptionOutput?.address, // replace with actual address
                                feeRate: feeRate,
                                priorityFee: BigInt(OpnetRateInputVal), // replace with actual OpnetRateInputVal
                                header: 'Swap Token', // replace with actual header
                                networkFee: feeRate,
                                slippageTolerance: slippageTolerance, // replace with actual networkFee
                                features: {
                                    rbf: false // replace with actual rbf value
                                },
                                inputInfos: [], // replace with actual inputInfos
                                isToSign: false, // replace with acdetual isToSign value
                                opneTokens: [
                                    {
                                        amount: expandToDecimals(inputAmount, selectedOption?.divisibility ?? 8),
                                        divisibility: selectedOption?.divisibility,
                                        spacedRune: selectedOption?.name,
                                        symbol: selectedOption?.symbol
                                    },
                                    {
                                        amount: expandToDecimals(outputAmount, selectedOptionOutput?.divisibility ?? 8),
                                        divisibility: selectedOptionOutput?.divisibility,
                                        spacedRune: selectedOptionOutput?.name,
                                        symbol: selectedOptionOutput?.symbol
                                    }
                                ],
                                action: 'swap' // replace with actual opneTokens
                            }
                        });
                    }}
                    full
                />
            </Column>
        </Layout>
    );
}
