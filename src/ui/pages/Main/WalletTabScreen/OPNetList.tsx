import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import BigNumber from 'bignumber.js';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import browser from 'webextension-polyfill';

import Web3API, { getOPNetChainType, getOPNetNetwork } from '@/shared/web3/Web3API';
import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';

import { ChainType } from '@/shared/constant';
import { NetworkType, OPTokenInfo } from '@/shared/types';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Address, OPNetMetadata } from '@btc-vision/transaction';

import { Button, Column, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';

import { RouteTypes, useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

BigNumber.config({ EXPONENTIAL_AT: 256 });

/** Number of tokens shown per page. */
const TOKENS_PER_PAGE = 3;

/** Cache to avoid re-fetching the same token balances. */
const balanceCache = new Map<string, OPTokenInfo>();

/** Simple interface to represent tokens stored in localStorage. */
interface StoredToken {
    address: string;
    hidden: boolean;
}

/**
 * Adds a default token (Moto contract) into the token list if it is missing.
 * Swallows any error that might occur.
 */
function pushDefaultTokens(tokens: (StoredToken | string)[], chain: ChainType, network: NetworkType) {
    const chainId = getOPNetChainType(chain);
    const opnetNetwork = getOPNetNetwork(network);

    try {
        const newTokenAddress = OPNetMetadata.getAddresses(opnetNetwork, chainId).moto.p2tr(Web3API.network);

        const alreadyExists = tokens.some((token) => {
            if (typeof token === 'string') return token === newTokenAddress;
            return token.address === newTokenAddress;
        });

        // If Moto token is missing, add it at the front
        if (!alreadyExists) {
            tokens.unshift({ address: newTokenAddress, hidden: false });
        }
    } catch (err) {
        console.error('Failed to add default token:', err);
    }
}

export function OPNetList() {
    const navigate = useNavigate();
    const wallet = useWallet();
    const currentAccount = useCurrentAccount();
    const chainType = useChainType();
    const tools = useTools();

    // Main tokens + balances
    const [tokens, setTokens] = useState<string[]>([]);
    const [tokenBalances, setTokenBalances] = useState<OPTokenInfo[]>([]);
    const [total, setTotal] = useState(-1);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // For "Import Token" modal
    const [importTokenBool, setImportTokenBool] = useState(false);

    // For the normal "Remove/Hide" token modal
    const [showModal, setShowModal] = useState(false);
    const [modalToken, setModalToken] = useState<string | null>(null);

    // For tokens that fail to load
    const [failedTokens, setFailedTokens] = useState<string[]>([]);
    const [currentFailedToken, setCurrentFailedToken] = useState<string | null>(null);
    const [showFailedModal, setShowFailedModal] = useState(false);

    /**
     * This flag helps avoid re-fetching balances repeatedly when removing tokens.
     */
    const skipBalancesRef = useRef(false);

    /**
     * Retrieves the tokens from localStorage once and sets tokens + total.
     * Uses an account-specific storage key (so each account has its own list).
     */
    const fetchTokens = useCallback(async () => {
        try {
            tools.showLoading(true);
            const chain = await wallet.getChainType();
            Web3API.setNetwork(chain);

            // Account-specific key (old code used `opnetTokens_${chain}` only)
            const accountAddr = currentAccount.pubkey;
            const storageKey = `opnetTokens_${chain}_${accountAddr}`;

            const tokensImported = localStorage.getItem(storageKey);
            const parsedTokens: (StoredToken | string)[] = tokensImported
                ? (JSON.parse(tokensImported) as (StoredToken | string)[])
                : [];

            const currentNetwork = await wallet.getNetworkType();
            pushDefaultTokens(parsedTokens, chain, currentNetwork);

            // Re-save in case default tokens were added
            if (parsedTokens.length) {
                localStorage.setItem(storageKey, JSON.stringify(parsedTokens.filter(Boolean)));
            }

            // Filter out "dead" address
            const deadAddress = Address.dead().p2tr(Web3API.network);
            const validTokens = parsedTokens.filter((token) => {
                if (typeof token === 'string') return token !== deadAddress;
                return token.address !== deadAddress;
            });

            // Only show visible tokens, then reverse so new tokens appear first
            const visibleTokens = validTokens
                .filter((token) => (typeof token === 'string' ? true : !token.hidden))
                .map((token) => (typeof token === 'string' ? token : token.address))
                .reverse();

            // Filter out duplicates so they are not displayed multiple times
            const uniqueTokens: string[] = [];
            const seenAddresses = new Set<string>();

            for (const addr of visibleTokens) {
                if (!seenAddresses.has(addr)) {
                    uniqueTokens.push(addr);
                    seenAddresses.add(addr);
                }
            }

            setTokens(uniqueTokens);
            setTotal(uniqueTokens.length || 0);
            setCurrentPage(1);
        } catch (err) {
            tools.toastError(`Error loading tokens: ${(err as Error).message}`);
        } finally {
            tools.showLoading(false);
        }
    }, [tools, wallet, currentAccount]);

    /**
     * Fetch the balances for the current page of tokens.
     * If forceRefresh = true, skip the cache for these tokens and re-fetch from chain.
     */
    const fetchTokenBalances = useCallback(async () => {
        if (skipBalancesRef.current) return;
        if (!tokens.length) {
            setTokenBalances([]);
            return;
        }

        try {
            tools.showLoading(true);

            const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
            const endIndex = Math.min(startIndex + TOKENS_PER_PAGE, tokens.length);
            const currentTokens = tokens.slice(startIndex, endIndex);

            const balances = await Promise.all(
                currentTokens.map(async (tokenAddress) => {
                    try {
                        const contractInfo: ContractInformation | OPTokenInfo | false | undefined = balanceCache.get(
                            tokenAddress
                        )
                            ? balanceCache.get(tokenAddress)
                            : await Web3API.queryContractInformation(tokenAddress);

                        if (!contractInfo || contractInfo.name === 'Generic Contract') {
                            setFailedTokens((prev) => [...prev, tokenAddress]);
                            return null;
                        }

                        const contract: IOP_20Contract = getContract<IOP_20Contract>(
                            tokenAddress,
                            OP_20_ABI,
                            Web3API.provider,
                            Web3API.network
                        );

                        const balance = await contract.balanceOf(Address.fromString(currentAccount.pubkey));
                        const tokenDetails: OPTokenInfo = {
                            address: tokenAddress,
                            name: contractInfo?.name || '',
                            amount: balance.properties.balance,
                            divisibility:
                                'divisibility' in contractInfo
                                    ? contractInfo.divisibility
                                    : contractInfo?.decimals || 8,
                            symbol: contractInfo.symbol,
                            logo: contractInfo?.logo
                        };

                        balanceCache.set(tokenAddress, tokenDetails);
                        return tokenDetails;
                    } catch (err) {
                        console.error('Error fetching balance:', tokenAddress, err);
                        setFailedTokens((prev) => [...prev, tokenAddress]);
                        return null;
                    }
                })
            );

            setTokenBalances(balances.filter(Boolean) as OPTokenInfo[]);
        } catch (err) {
            tools.toastError(`Failed to load token balances: ${(err as Error).message}`);
        } finally {
            tools.showLoading(false);
        }
    }, [currentAccount, currentPage, tokens, tools]);

    // Fetch tokens once on mount (and whenever importTokenBool changes),
    // not every time tokens state changes
    useEffect(() => {
        fetchTokens().catch((err: unknown) => console.error(err));
    }, [fetchTokens, chainType, currentAccount, importTokenBool]);

    // Fetch balances whenever tokens or page changes, unless skipping
    useEffect(() => {
        fetchTokenBalances();
    }, [fetchTokenBalances, tokens, currentPage, currentAccount]);

    // If new failures appear, display them one by one
    useEffect(() => {
        if (!currentFailedToken && failedTokens.length > 0) {
            const [firstFailed] = failedTokens;
            setCurrentFailedToken(firstFailed);
            setShowFailedModal(true);
        } else if (failedTokens.length === 0) {
            setCurrentFailedToken(null);
            setShowFailedModal(false);
        }
    }, [failedTokens, currentFailedToken]);

    /**
     * Handle removing or keeping a token that failed to load.
     */
    const handleRemoveFailedToken = async (shouldRemove: boolean) => {
        if (!currentFailedToken) return;
        skipBalancesRef.current = true;

        if (shouldRemove) {
            try {
                const chain = await wallet.getChainType();
                const accountAddr = currentAccount.pubkey;
                const storageKey = `opnetTokens_${chain}_${accountAddr}`;

                const storedTokens = JSON.parse(localStorage.getItem(storageKey) || '[]') as (StoredToken | string)[];

                // Filter out the token we want to remove
                const updatedStored = storedTokens.filter((t) => {
                    if (typeof t === 'object') return t.address !== currentFailedToken;
                    return t !== currentFailedToken;
                });

                localStorage.setItem(storageKey, JSON.stringify(updatedStored));

                // Also remove from our tokens array
                setTokens((prev) => {
                    const newArr = prev.filter((addr) => addr !== currentFailedToken);
                    setTotal(newArr.length);
                    return newArr;
                });

                balanceCache.delete(currentFailedToken);
                tools.toastSuccess(`Token ${currentFailedToken} removed successfully!`);
            } catch (err) {
                tools.toastError(`Failed to remove the token: ${(err as Error).message}`);
            }
        }

        setFailedTokens((prev) => prev.filter((t) => t !== currentFailedToken));
        setCurrentFailedToken(null);
        setShowFailedModal(false);
        skipBalancesRef.current = false;
    };

    /**
     * Open Remove/Hide modal
     */
    const handleRemoveToken = (address: string) => {
        setModalToken(address);
        setShowModal(true);
    };

    type ModalAction = 'remove' | 'hide';

    /**
     * Remove/Hide a token in localStorage
     */
    const handleModalAction = async (action: ModalAction) => {
        if (!modalToken) return;
        skipBalancesRef.current = true;

        try {
            const chain = await wallet.getChainType();
            const accountAddr = currentAccount.pubkey;
            const storageKey = `opnetTokens_${chain}_${accountAddr}`;

            const storedTokens = JSON.parse(localStorage.getItem(storageKey) || '[]') as (StoredToken | string)[];

            let updatedTokens: (StoredToken | string)[];

            if (action === 'remove') {
                // Filter out this token
                updatedTokens = storedTokens.filter((t) => {
                    if (typeof t === 'object') return t.address !== modalToken;
                    return t !== modalToken;
                });
            } else {
                // Hide this token
                updatedTokens = storedTokens.map((t) => {
                    if (typeof t === 'object' && t.address === modalToken) {
                        return { ...t, hidden: true };
                    }
                    if (typeof t === 'string' && t === modalToken) {
                        return { address: t, hidden: true };
                    }
                    return t;
                });
            }

            localStorage.setItem(storageKey, JSON.stringify(updatedTokens));

            // Remove from our visible tokens
            setTokens((prev) => {
                const newArr = prev.filter((addr) => addr !== modalToken);
                setTotal(newArr.length);
                return newArr;
            });

            // Fix pagination if needed
            const totalItems = tokens.length - 1;
            const totalPages = Math.ceil(totalItems / TOKENS_PER_PAGE);
            if (currentPage > totalPages) {
                setCurrentPage(totalPages > 0 ? totalPages : 1);
            }

            // Clear from cache if removed
            if (action === 'remove') {
                balanceCache.delete(modalToken);
            }

            tools.toastSuccess(`Token ${action === 'remove' ? 'removed' : 'hidden'} successfully!`);
        } catch (err) {
            tools.toastError(`Failed to ${action} the token.`);
            console.error(err);
        } finally {
            setShowModal(false);
            setModalToken(null);
            skipBalancesRef.current = false;
        }
    };

    /**
     * Show all hidden tokens again
     */
    const showHiddenTokens = async () => {
        try {
            const chain = await wallet.getChainType();
            const accountAddr = currentAccount.pubkey;
            const storageKey = `opnetTokens_${chain}_${accountAddr}`;

            const storedTokens = JSON.parse(localStorage.getItem(storageKey) || '[]') as (StoredToken | string)[];

            // Find all that are hidden
            const previouslyHidden = storedTokens.filter((t) => typeof t === 'object' && t.hidden) as StoredToken[];

            if (!previouslyHidden.length) {
                tools.toastSuccess('There are no hidden tokens to show.');
                return;
            }

            const updatedStoredTokens = storedTokens.map((t) => {
                if (typeof t === 'object' && t.hidden) {
                    return { ...t, hidden: false };
                }
                return t;
            });

            localStorage.setItem(storageKey, JSON.stringify(updatedStoredTokens));

            // Re-add them into our tokens array
            const newlyVisibleAddresses = previouslyHidden.map((t) => t.address);
            setTokens((prev) => {
                const combined = [...prev, ...newlyVisibleAddresses];
                setTotal(combined.length);
                return combined;
            });

            tools.toastSuccess('Hidden tokens are now visible!');
        } catch (err) {
            tools.toastError('Failed to show hidden tokens.');
            console.error(err);
        }
    };

    const totalPages = Math.ceil(total / TOKENS_PER_PAGE);
    const handlePageChange = (direction: 'next' | 'prev') => {
        setCurrentPage((prev) => {
            if (direction === 'next' && prev < totalPages) return prev + 1;
            if (direction === 'prev' && prev > 1) return prev - 1;
            return prev;
        });
    };

    // If total === -1, we're still initializing.
    if (total === -1) {
        return (
            <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
                <LoadingOutlined />
            </Column>
        );
    }

    /** Styles */
    const $footerBaseStyle: CSSProperties = {
        display: 'block',
        minHeight: 20,
        paddingBottom: 10,
        fontSize: 12,
        cursor: 'pointer',
        marginBottom: 10
    };

    const $opnet: CSSProperties = {
        display: 'block',
        marginBottom: 10
    };

    const $btnStyle: CSSProperties = {
        width: '33%',
        fontSize: '10px'
    };

    return (
        <div>
            {/* Top Buttons */}
            <BaseView style={$footerBaseStyle}>
                <Row>
                    <Button
                        style={$btnStyle}
                        text="Import Token"
                        preset="fontsmall"
                        icon="eye"
                        onClick={() => setImportTokenBool(true)}
                    />
                    <Button
                        style={$btnStyle}
                        text="Refresh List"
                        preset="fontsmall"
                        icon="history"
                        // ----- IMPORTANT CHANGE: ONLY REFRESH BALANCES -----
                        onClick={() => {
                            fetchTokenBalances().catch((err: unknown) => console.error(err));
                        }}
                    />
                    <Button
                        style={$btnStyle}
                        text="Deploy"
                        icon="pencil"
                        preset="fontsmall"
                        onClick={async () => {
                            await browser.tabs.create({
                                url: browser.runtime.getURL('/index.html#/opnet/deploy-contract')
                            });
                        }}
                    />
                </Row>
            </BaseView>

            {/* Token List & Pagination */}
            {total > 0 && (
                <BaseView style={$opnet}>
                    {tokenBalances.map((data) => (
                        <Row
                            key={data.address}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px'
                            }}>
                            <OpNetBalanceCard
                                tokenInfo={data}
                                onClick={() => {
                                    navigate(RouteTypes.OpNetTokenScreen, {
                                        address: data.address
                                    });
                                }}
                                handleRemoveToken={handleRemoveToken}
                            />
                        </Row>
                    ))}

                    {/* Pagination Controls */}
                    <Row
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                        <Button text="Prev" onClick={() => handlePageChange('prev')} disabled={currentPage === 1} />
                        {Array.from({ length: totalPages }, (_, idx) => {
                            const pageNumber = idx + 1;
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
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    />
                                );
                            }
                            if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                                return (
                                    <span key={pageNumber} style={{ padding: '5px' }}>
                                        ...
                                    </span>
                                );
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

            <BaseView style={$opnet}>
                {/* Show Hidden Tokens */}
                <Row style={{ marginTop: '12px' }}>
                    <Button
                        style={{ width: '100%', fontSize: '10px' }}
                        text="Show Hidden Tokens"
                        preset="fontsmall"
                        onClick={showHiddenTokens}
                    />
                </Row>
            </BaseView>

            {/* Import Token Modal */}
            {importTokenBool && (
                <AddOpNetToken
                    setImportTokenBool={setImportTokenBool}
                    fetchData={fetchTokens}
                    onClose={() => setImportTokenBool(false)}
                />
            )}

            {/* Normal Remove/Hide Token Modal */}
            <Modal
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                closeIcon={<CloseOutlined style={{ fontSize: '24px' } as CSSProperties} />}>
                <Row>
                    <Text text="Remove or Hide Token" preset="title-bold" size="xxl" />
                </Row>
                <Row style={{ marginTop: '12px' }}>
                    <Text
                        text="You can either remove or hide this token. Removing the token will permanently delete it from the list (you will need to manually import it in the future). Hiding the token only temporarily removes it from the list, but you can bring it back by clicking 'Show Hidden Tokens' later."
                        size="md"
                    />
                </Row>
                <Row
                    style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        marginTop: '20px'
                    }}>
                    <Button
                        text="Hide"
                        onClick={async () => {
                            await handleModalAction('hide');
                        }}
                    />
                    <Button
                        text="Remove"
                        onClick={async () => {
                            await handleModalAction('remove');
                        }}
                    />
                </Row>
            </Modal>

            {/* Failed-to-Load Token Modal */}
            <Modal
                open={showFailedModal}
                onCancel={() => handleRemoveFailedToken(false)}
                footer={null}
                closeIcon={<CloseOutlined style={{ fontSize: '24px' } as CSSProperties} />}>
                <Row>
                    <Text text="Token Failed to Load" preset="title-bold" size="xxl" />
                </Row>
                <Row style={{ marginTop: '12px' }}>
                    <Text
                        text={`We couldn't fetch balance/contract info for: ${
                            currentFailedToken ?? ''
                        }.\nWould you like to remove it from your list?`}
                        size="md"
                    />
                </Row>
                <Row
                    style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        marginTop: '20px'
                    }}>
                    <Button text="Yes, Remove" onClick={() => handleRemoveFailedToken(true)} />
                    <Button text="No, Keep" onClick={() => handleRemoveFailedToken(false)} />
                </Row>
            </Modal>
        </div>
    );
}
