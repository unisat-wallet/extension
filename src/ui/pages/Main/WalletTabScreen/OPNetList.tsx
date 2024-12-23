import BigNumber from 'bignumber.js';
import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';
import { CSSProperties, useCallback, useEffect, useState } from 'react';

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

import { useChainType } from '@/ui/state/settings/hooks';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import browser from 'webextension-polyfill';
import { RouteTypes, useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

BigNumber.config({ EXPONENTIAL_AT: 256 });

const TOKENS_PER_PAGE = 3;

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
    const chainType = useChainType();

    const [tokens, setTokens] = useState<string[]>([]);
    const [tokenBalances, setTokenBalances] = useState<OPTokenInfo[]>([]);
    const [total, setTotal] = useState(-1);
    const [importTokenBool, setImportTokenBool] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const tools = useTools();

    const fetchTokens = useCallback(async () => {
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
            const validTokens = parsedTokens.filter((tokenAddress) => tokenAddress && tokenAddress !== deadAddress);

            setTokens(validTokens);
            setTotal(validTokens.length);
        } catch (e) {
            tools.toastError(`Error loading tokens: ${(e as Error).message}`);
        } finally {
            tools.showLoading(false);
        }
    }, [wallet, tools]);

    const fetchTokenBalances = useCallback(async () => {
        try {
            tools.showLoading(true);

            const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
            const endIndex = Math.min(startIndex + TOKENS_PER_PAGE, tokens.length);

            const currentTokens = tokens.slice(startIndex, endIndex);

            const balances = await Promise.all(
                currentTokens.map(async (tokenAddress) => {
                    try {

                        const contractInfo: ContractInformation | undefined =
                            await Web3API.queryContractInformation(tokenAddress);

                        if (!contractInfo || contractInfo.name === 'Generic Contract') {
                            return null;
                        }

                        const contract: IOP_20Contract = getContract<IOP_20Contract>(
                            tokenAddress,
                            OP_20_ABI,
                            Web3API.provider,
                            Web3API.network
                        );

                        const balance = await contract.balanceOf(Address.fromString(currentAccount.pubkey));

                        return {
                            address: tokenAddress,
                            name: contractInfo?.name || '',
                            amount: balance.properties.balance,
                            divisibility: contractInfo?.decimals || 8,
                            symbol: contractInfo.symbol,
                            logo: contractInfo?.logo
                        };
                    } catch (e) {
                        console.error(`Error fetching balance for token:`, e, tokenAddress);
                        return null;
                    }
                })
            );


            const validBalances = balances.filter((balance) => balance !== null) as OPTokenInfo[];
            setTokenBalances(validBalances);
        } catch (e) {
            tools.toastError(`Something went wrong while attempting to load tokens: ${(e as Error).message}`);
        } finally {
            tools.showLoading(false);
        }
    }, [currentPage, tokens, currentAccount, tools]);

    const handleRemoveToken = async (address: string) => {
        try {
            const getChain = await wallet.getChainType();
            const storedTokens = JSON.parse(localStorage.getItem('opnetTokens_' + getChain) || '[]');

            const updatedStoredTokens = storedTokens.filter((token: string) => token !== address);
            localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(updatedStoredTokens));

            const updatedTokens = tokens.filter((token) => token !== address);
            setTokens(updatedTokens);
            setTotal(updatedTokens.length);

            tools.toastSuccess('Token removed successfully!');
        } catch (error) {
            tools.toastError('Failed to remove the token.');
            console.error(error);
        }
    };
    

    useEffect(() => {
        setTimeout(() => {
            fetchTokens();
        }, 100);
    }, [chainType, currentAccount, importTokenBool, wallet]);

    useEffect(() => {
        if (tokens.length > 0) {
            setTimeout(() => {
                fetchTokenBalances();
            }, 100);
        }
    }, [tokens, currentPage]);

    const totalPages = Math.ceil(total / TOKENS_PER_PAGE);

    const handlePageChange = (direction: 'next' | 'prev') => {
        setCurrentPage((prev) => {
            if (direction === 'next' && prev < totalPages) return prev + 1;
            if (direction === 'prev' && prev > 1) return prev - 1;
            return prev;
        });
    };

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
                        onClick={fetchTokens}></Button>
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
                    {tokenBalances.map((data, index) => (
                        <Row key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <OpNetBalanceCard
                                key={index}
                                tokenBalance={data}
                                onClick={() => {
                                    navigate(RouteTypes.OpNetTokenScreen, {
                                        address: data.address
                                    });                
                                }}
                            />
                            <FontAwesomeIcon onClick={() => handleRemoveToken(data.address)} icon={faTrashCan} style={{ height: '1rem', cursor: 'pointer', marginBottom: '10px'}} />
                        </Row>
                    ))}

                    <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button
                            text="Prev"
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                        />
                        {Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;

                            const shouldShow =
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);

                            if (shouldShow) {
                                return (
                                    <Button
                                        key={pageNumber}
                                        text={pageNumber.toString()}
                                        style={{
                                            backgroundColor: currentPage === pageNumber ? '#383535' : '#000000',
                                            fontWeight: currentPage === pageNumber ? 'bold' : 'normal',
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    />
                                );
                            }

                            if (
                                pageNumber === currentPage - 3 ||
                                pageNumber === currentPage + 3
                            ) {
                                return <span key={pageNumber} style={{ padding: '5px' }}>...</span>;
                            }

                            return null;
                        })}
                        <Button
                            text="Next"
                            onClick={() => handlePageChange('next')}
                            disabled={currentPage === totalPages}
                        />
                    </Row>
                </BaseView>
            )}

            {importTokenBool && (
                <AddOpNetToken
                    setImportTokenBool={setImportTokenBool}
                    fetchData={fetchTokens}
                    onClose={() => setImportTokenBool(false)}
                />
            )}
        </div>
    );
}
