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
import { CSSProperties, useEffect, useState } from 'react';

import { OPTokenInfo } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Input, Layout, Row, Select, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';
import { Address } from '@btc-vision/transaction';

import { Action, Features, SwapParameters } from '@/shared/interfaces/RawTxParameters';
import { RouteTypes, useNavigate } from '../MainRoute';

BigNumber.config({ EXPONENTIAL_AT: 256 });

interface StoredToken {
    address: string;
    hidden: boolean;
}

export default function Swap() {
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

    const wallet = useWallet();
    const currentAccount = useCurrentAccount();
    const tools = useTools();

    // -------------
    // Handlers
    // -------------
    const handleSelect = async (option: OPTokenInfo) => {
        // Prevent selecting the same token for input and output
        if (option.address === selectedOptionOutput?.address) {
            tools.toastError("Token In and Token Out can't be the same");
            return;
        }
        await handleInputChange(inputAmount);
        setSelectedOption(option);
    };

    const handleSelectOutput = async (option: OPTokenInfo) => {
        if (option.address === selectedOption?.address) {
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
            // If both tokens are selected, try fetching quote
            if (selectedOption && selectedOptionOutput) {
                const maxBalance = new BigNumber(selectedOption.amount.toString()).dividedBy(
                    new BigNumber(10).pow(selectedOption.divisibility)
                );

                // If the input is not empty and is a valid number
                if (value !== '' && value !== '.') {
                    const numericValue = new BigNumber(value);
                    // Check balance
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
                        // We need original pubkeys for these tokens
                        const pubKeyInfoSelectedOption = (await Web3API.provider.getPublicKeysInfo([
                            selectedOption.address,
                            selectedOptionOutput.address
                        ])) as AddressesInfo;

                        const originalPubKeyInput: Address = pubKeyInfoSelectedOption[selectedOption.address];
                        const originalPubKeyOutput: Address = pubKeyInfoSelectedOption[selectedOptionOutput.address];

                        const getData = await getQuote.getAmountsOut(
                            BigInt(Number(numericValue) * Math.pow(10, selectedOption.divisibility)),
                            [originalPubKeyInput, originalPubKeyOutput]
                        );

                        setOutPutAmount(
                            BitcoinUtils.formatUnits(
                                // amountsOut[1] = quote for tokenOut
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
                // If no token is selected yet, just set the input value
                setInputAmount(value);
            }
        }
    };

    // -------------
    // UI Styles
    // -------------
    const $searchInputStyle = {
        width: '40%',
        padding: 8,
        fontSize: fontSizes.md,
        border: 'none',
        borderRadius: 0,
        outline: 'none',
        height: '42px',
        backgroundColor: '#2a2626'
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

    // -------------
    // Load tokens (account-specific)
    // -------------
    useEffect(() => {
        const loadTokens = async () => {
            try {
                setLoading(true);
                // Use an account-specific storage key
                const chain = await wallet.getChainType();
                Web3API.setNetwork(chain);

                const accountAddr = currentAccount.pubkey;
                const storageKey = `opnetTokens_${chain}_${accountAddr}`;
                const tokensImported = localStorage.getItem(storageKey);
                const parsedTokens = tokensImported ? (JSON.parse(tokensImported) as (StoredToken | string)[]) : [];

                // Filter out hidden tokens and deduplicate addresses
                const visibleAddresses: string[] = [];
                const seen = new Set<string>();

                for (const token of parsedTokens) {
                    let address: string;
                    if (typeof token === 'object') {
                        if (token.hidden) continue; // skip hidden tokens
                        address = token.address;
                    } else {
                        address = token;
                    }

                    if (!seen.has(address)) {
                        visibleAddresses.push(address);
                        seen.add(address);
                    }
                }

                const tokenBalances: OPTokenInfo[] = [];
                for (const addr of visibleAddresses) {
                    try {
                        const contractInfo: ContractInformation | false | undefined =
                            await Web3API.queryContractInformation(addr);
                        if (!contractInfo) continue;

                        const contract = getContract<IOP_20Contract>(
                            addr,
                            OP_20_ABI,
                            Web3API.provider,
                            Web3API.network
                        );

                        const balance = await contract.balanceOf(Address.fromString(accountAddr));
                        tokenBalances.push({
                            address: addr,
                            name: contractInfo.name ?? '',
                            amount: balance.properties.balance,
                            divisibility: contractInfo.decimals ?? 8,
                            symbol: contractInfo.symbol ?? '',
                            logo: contractInfo.logo
                        });
                    } catch (e) {
                        console.log(`Error fetching info for token ${addr}:`, e);
                    }
                }

                setSwitchOptions(tokenBalances);
            } catch (err) {
                console.error('Failed to load tokens in Swap:', err);
                tools.toastError('Failed to load tokens. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        void loadTokens();
    }, [wallet, currentAccount, tools]);

    // -------------
    // Loading
    // -------------
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

    // -------------
    // Render
    // -------------
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
                            setMax={setMax}
                            options={switchOptions}
                            selectedoptionuse={selectedOption}
                            placeholder="Select Token"
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
                            selectedoptionuse={selectedOptionOutput}
                            placeholder="Select Token"
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
                        placeholder="5%"
                        value={slippageTolerance}
                        onAmountInputChange={(value) => {
                            const numValue = Number(value);
                            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                setSlippageTolerance(value);
                            }
                        }}
                        autoFocus
                    />

                    <Text text="Priority Fee" color="textDim" />
                    <Input
                        preset="amount"
                        placeholder="sat/vB"
                        value={OpnetRateInputVal}
                        onAmountInputChange={(amount) => {
                            adjustFeeRateInput(amount);
                        }}
                        autoFocus
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
                        if (!selectedOption || !selectedOptionOutput) {
                            tools.toastError('Please select tokens');
                            return;
                        }

                        const event: SwapParameters = {
                            amountIn: Number(inputAmount),
                            amountOut: Number(outputAmount),
                            tokenIn: selectedOption.address,
                            tokenOut: selectedOptionOutput.address,
                            slippageTolerance: Number(slippageTolerance),
                            deadline: '1000000000000',
                            tokens: [selectedOption, selectedOptionOutput],
                            feeRate: feeRate,
                            features: {
                                [Features.rbf]: true
                            },
                            priorityFee: 0n,
                            header: `Swap ${selectedOption.symbol} for ${selectedOptionOutput.symbol}`,
                            action: Action.Swap
                        };

                        navigate(RouteTypes.TxOpnetConfirmScreen, {
                            rawTxInfo: event
                        });
                    }}
                    full
                />
            </Column>
        </Layout>
    );
}
