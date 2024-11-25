import BigNumber from 'bignumber.js';
import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';
import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { OPTokenInfo } from '@/shared/types';
import { addressShortner } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { Wallet } from '@btc-vision/transaction';

import { RouteTypes, useNavigate } from '../MainRoute';

interface LocationState {
    address: string;
}

export default function OpNetTokenScreen() {
    const navigate = useNavigate();

    const params = useLocationState<LocationState>();
    const [tokenSummary, setTokenSummary] = useState<OPTokenInfo>({
        address: '',
        name: '',
        symbol: '',
        logo: '',
        amount: 0n,
        divisibility: 0
    });

    const [btcBalance, setBtcBalance] = useState<OPTokenInfo>({
        address: '',
        name: '',
        symbol: '',
        logo: '',
        amount: 0n,
        divisibility: 0
    });

    const getWallet = async () => {
        const currentWalletAddress = await wallet.getCurrentAccount();
        const pubkey = currentWalletAddress.pubkey;

        const wifWallet = await wallet.getInternalPrivateKey({
            pubkey: pubkey,
            type: currentWalletAddress.type
        });

        return Wallet.fromWif(wifWallet.wif, Web3API.network);
    };

    const account = useCurrentAccount();

    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const wallet = useWallet();

    const unitBtc = useBTCUnit();
    useEffect(() => {
        const getAddress = async () => {
            Web3API.setNetwork(await wallet.getChainType());

            const myWallet = await getWallet();
            const btcBalance = await Web3API.getBalance(account.address, true);
            setBtcBalance({
                address: '',
                amount: btcBalance,
                divisibility: 8,
                symbol: unitBtc,
                name: 'Bitcoin',
                logo: ''
            });

            const contract: IOP_20Contract = getContract<IOP_20Contract>(
                params.address,
                OP_20_ABI,
                Web3API.provider,
                Web3API.network,
                myWallet.address
            );

            const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(
                params.address
            );
            if (!contractInfo) {
                throw new Error('Contract information not found');
            }

            try {
                const balance = await contract.balanceOf(myWallet.address);
                const newSummaryData = {
                    address: params.address,
                    name: contractInfo.name ?? '',
                    amount: balance.properties.balance,
                    divisibility: contractInfo.decimals ?? 8,
                    symbol: contractInfo.symbol,
                    logo: contractInfo.logo
                };

                setTokenSummary(newSummaryData);
            } catch (e) {
                tools.toastError('Error in getting balance');
                return;
            }

            try {
                const getOwner = await contract.owner();
                setIsOwner(myWallet.address.equals(getOwner.properties.owner));
            } catch (e) {
                tools.toastError('Error in getting owner');
                return;
            }

            setLoading(false);
        };

        void getAddress();
    }, [account.address, unitBtc]);

    const enableTransfer = useMemo(() => {
        let enable = false;
        if (tokenSummary.amount) {
            enable = true;
        }

        return enable;
    }, [tokenSummary]);

    const copy = async (data: string) => {
        await copyToClipboard(data);
        tools.toastSuccess(`Copied!`);
    };

    const deleteToken = async () => {
        const getChain = await wallet.getChainType();
        const tokensImported = localStorage.getItem('opnetTokens_' + getChain);

        if (tokensImported) {
            let updatedTokens: string[] = JSON.parse(tokensImported) as string[];
            updatedTokens = updatedTokens.filter((address) => address !== tokenSummary.address);
            localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(updatedTokens));
        }

        tools.toastSuccess('Token removed from imported list');
        window.history.go(-1);
    };

    const tools = useTools();
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
            {tokenSummary && (
                <Content>
                    <Column py="xl" style={{ borderBottomWidth: 1, borderColor: colors.white_muted }}>
                        <Row itemsCenter fullX justifyCenter>
                            <Image src={tokenSummary.logo} size={fontSizes.tiny} />
                            <Text
                                text={`${runesUtils.toDecimalAmount(
                                    new BigNumber(tokenSummary.amount.toString()),
                                    tokenSummary.divisibility
                                )} ${tokenSummary.symbol}`}
                                preset="bold"
                                textCenter
                                size="xxl"
                                wrap
                            />
                        </Row>

                        <Row
                            itemsCenter
                            fullX
                            justifyCenter
                            onClick={(e) => {
                                copy(tokenSummary.address);
                            }}>
                            <Icon icon="copy" color="textDim" />
                            <Text
                                text={addressShortner(tokenSummary.address)}
                                color="textDim"
                                style={{
                                    overflowWrap: 'anywhere'
                                }}
                            />
                        </Row>

                        <Row justifyBetween mt="lg">
                            <Button
                                text="Send"
                                preset="primary"
                                icon="send"
                                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                                disabled={!enableTransfer}
                                onClick={(e) => {
                                    navigate(RouteTypes.SendOpNetScreen, tokenSummary);
                                }}
                                full
                            />
                        </Row>
                        <Row justifyBetween mt="lg">
                            {/*btcBalance.divisibility == 8 ? (
                                <>
                                    <Button
                                        text="Stake WBTC"
                                        preset="primary"
                                        icon="down"
                                        onClick={(e) => {
                                            navigate(RouteTypes.StakeWBTCoPNet, tokenSummary);
                                        }}
                                        full
                                    />
                                    <Button
                                        text="Unstake WBTC"
                                        preset="primary"
                                        icon="up"
                                        onClick={(e) => {
                                            navigate(RouteTypes.UnStakeWBTCoPNet, tokenSummary);
                                        }}
                                        full
                                    />
                                </>
                            ) : (
                                <></>
                            )*/}
                        </Row>

                        {/*btcBalance.divisibility == 8 ? (
                            <>
                                <Row itemsCenter fullX justifyBetween>
                                    <Text text={'Active Stake'} color="textDim" size="md" />
                                    <Text
                                        text={bigIntToDecimal(stakedAmount, 8).toString() + ' ' + tokenSummary.symbol}
                                        size="md"
                                    />
                                </Row>
                                <Row itemsCenter fullX justifyBetween>
                                    <Text text={'Reward'} color="textDim" size="md" />
                                    <Text
                                        text={bigIntToDecimal(stakedReward, 8).toString() + ' ' + tokenSummary.symbol}
                                        size="md"
                                    />
                                </Row>
                                <Row itemsCenter fullX justifyBetween>
                                    <Text text={'Total Staked'} color="textDim" size="md" />
                                    <Text
                                        text={bigIntToDecimal(totalStaked, 8).toString() + ' ' + tokenSummary.symbol}
                                        size="md"
                                    />
                                </Row>
                                <Row itemsCenter fullX justifyBetween>
                                    <Text text={'Reward Pool'} color="textDim" size="md" />
                                    <Text
                                        text={bigIntToDecimal(rewardPool, 8).toString() + ' ' + tokenSummary.symbol}
                                        size="md"
                                    />
                                </Row>
                            </>
                        ) : (
                            <></>
                        )*/}
                    </Column>

                    <Text
                        text={tokenSummary.name}
                        preset="title-bold"
                        onClick={() => {
                            copyToClipboard(tokenSummary.name).then(() => {
                                tools.toastSuccess('Copied');
                            });
                        }}></Text>
                    <Row justifyBetween full>
                        {isOwner ? (
                            <>
                                <Button
                                    text="Mint"
                                    preset="primary"
                                    icon="pencil"
                                    onClick={(e) => {
                                        navigate(RouteTypes.Mint, tokenSummary);
                                    }}
                                    full
                                />
                            </>
                        ) : (
                            <></>
                        )}

                        <Button
                            text="Swap"
                            preset="primary"
                            icon="send"
                            style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                            disabled={!enableTransfer}
                            onClick={(e) => {
                                navigate(RouteTypes.Swap, tokenSummary);
                            }}
                            full
                        />
                        <Button
                            text="Delete"
                            preset="primary"
                            icon="close"
                            style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                            disabled={!enableTransfer}
                            onClick={async () => {
                                // Remove the token address from tokensImported in localStorage
                                await deleteToken();
                            }}
                            full
                        />
                    </Row>
                </Content>
            )}
        </Layout>
    );
}
