import BigNumber from 'bignumber.js';
import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';
import { CSSProperties, useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { NetworkType, OPTokenInfo } from '@/shared/types';
import Web3API, { getOPNetChainType, getOPNetNetwork } from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { Address, OPNetMetadata } from '@btc-vision/transaction';

import browser from 'webextension-polyfill';
import { RouteTypes, useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

BigNumber.config({ EXPONENTIAL_AT: 256 });

function pushDefaultTokens(tokens: string[], chain: ChainType, network: NetworkType) {
    const chainId = getOPNetChainType(chain);
    const opnetNetwork = getOPNetNetwork(network);

    try {
        const metadata = OPNetMetadata.getAddresses(opnetNetwork, chainId);
        if (!tokens.includes(metadata.moto.p2tr(Web3API.network))) {
            tokens.push(metadata.moto.p2tr(Web3API.network));
        }
    } catch (e) {}
}

export function OPNetList() {
    const navigate = useNavigate();
    const wallet = useWallet();
    const currentAccount = useCurrentAccount();

    const [tokens, setTokens] = useState<OPTokenInfo[]>([]);
    const [total, setTotal] = useState(-1);
    const [retried, setRetried] = useState(false);
    const [importTokenBool, setImportTokenBool] = useState(false);

    const tools = useTools();

    const fetchData = async () => {
        try {
            tools.showLoading(true);

            const getChain = await wallet.getChainType();
            Web3API.setNetwork(getChain);

            const tokensImported = localStorage.getItem('opnetTokens_' + getChain);
            let parsedTokens: string[] = [];
            if (tokensImported) {
                parsedTokens = JSON.parse(tokensImported) as string[];
            }

            const currentNetwork = await wallet.getNetworkType();
            pushDefaultTokens(parsedTokens, getChain, currentNetwork);

            if (parsedTokens.length) {
                localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(parsedTokens));
            }

            const deadAddress = Address.dead().p2tr(Web3API.network);
            const tokenBalances: OPTokenInfo[] = [];
            for (let i = 0; i < parsedTokens.length; i++) {
                try {
                    const tokenAddress = parsedTokens[i];
                    if (tokenAddress === deadAddress || !tokenAddress) {
                        continue;
                    }

                    const contractInfo: ContractInformation | undefined =
                        await Web3API.queryContractInformation(tokenAddress);

                    if (!contractInfo) {
                        continue;
                    }

                    if (contractInfo.name === 'Generic Contract') {
                        //parsedTokens.splice(i, 1);
                        //i--;
                        continue;
                    }

                    const contract: IOP_20Contract = getContract<IOP_20Contract>(
                        tokenAddress,
                        OP_20_ABI,
                        Web3API.provider,
                        Web3API.network
                    );

                    const balance = await contract.balanceOf(Address.fromString(currentAccount.pubkey));
                    tokenBalances.push({
                        address: tokenAddress,
                        name: contractInfo?.name || '',
                        amount: balance.properties.balance,
                        divisibility: contractInfo?.decimals || 8,
                        symbol: contractInfo.symbol,
                        logo: contractInfo?.logo
                    });
                } catch (e) {
                    console.log(`Error processing token at index ${i}:`, e, parsedTokens[i]);
                }
            }

            localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(parsedTokens));

            setTokens(tokenBalances);
            setTotal(tokenBalances.length);
        } catch (e) {
            tools.toastError(`Something went wrong while attempting to load tokens: ${(e as Error).message}`);
        } finally {
            tools.showLoading(false);
        }

        setRetried(true);
    };

    useEffect(() => {
        if (tokens.length !== 0 || retried) {
            return;
        }

        setTimeout(() => {
            if (tokens.length === 0) {
                void fetchData();
            }
        }, 100);
    }, [tokens, currentAccount, importTokenBool, wallet]);

    //useEffect(() => {
    //    void fetchData();
    //}, [currentAccount, importTokenBool, wallet]);

    // useEffect(() => {}, [total]);

    if (total === -1) {
        return (
            <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
                <LoadingOutlined />
            </Column>
        );
    }

    const $footerBaseStyle = {
        display: 'block',
        minHeight: 20,
        paddingBottom: 10,
        fontSize: 12,
        cursor: 'pointer',
        marginBottom: 10
    } as CSSProperties;

    const $opnet = {
        display: 'block',
        marginBottom: 10
    } as CSSProperties;

    const $btnStyle = {
        width: '33%',
        fontSize: '10px'
    } as CSSProperties;

    return (
        <div>
            <BaseView style={$footerBaseStyle}>
                <Row>
                    <Button
                        style={$btnStyle}
                        text="Import Token"
                        preset="fontsmall"
                        icon={'eye'}
                        onClick={() => setImportTokenBool(true)}></Button>

                    <Button
                        style={$btnStyle}
                        text="Refresh List"
                        preset="fontsmall"
                        icon={'history'}
                        onClick={() => fetchData()}></Button>
                    <Button
                        style={$btnStyle}
                        text="Deploy"
                        icon={'pencil'}
                        preset="fontsmall"
                        onClick={async () => {
                            await browser.tabs.create({
                                url: browser.runtime.getURL('/index.html#/opnet/deploy-contract')
                            });
                        }}></Button>
                </Row>
            </BaseView>

            {total > 0 && (
                <BaseView style={$opnet}>
                    {tokens.map((data, index) => {
                        return (
                            <div key={index}>
                                <OpNetBalanceCard
                                    key={index}
                                    tokenBalance={data}
                                    onClick={() => {
                                        navigate(RouteTypes.OpNetTokenScreen, {
                                            address: data.address
                                        });
                                    }}
                                />
                            </div>
                        );
                    })}
                </BaseView>
            )}

            {importTokenBool && (
                <AddOpNetToken
                    setImportTokenBool={setImportTokenBool}
                    fetchData={fetchData}
                    onClose={() => {
                        setImportTokenBool(false);
                    }}
                />
            )}
        </div>
    );
}
