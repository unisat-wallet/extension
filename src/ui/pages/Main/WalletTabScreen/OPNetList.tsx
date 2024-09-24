import BigNumber from 'bignumber.js';
import { getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI } from 'opnet';
import { CSSProperties, useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { NetworkType, OpNetBalance } from '@/shared/types';
import Web3API, { getOPNetChainType, getOPNetNetwork } from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { Address } from '@btc-vision/bsi-binary';
import { OPNetMetadata } from '@btc-vision/transaction';

import { useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

BigNumber.config({ EXPONENTIAL_AT: 256 });

function pushDefaultTokens(tokens: Address[], chain: ChainType, network: NetworkType) {
    const chainId = getOPNetChainType(chain);
    const opnetNetwork = getOPNetNetwork(network);

    try {
        const metadata = OPNetMetadata.getAddresses(opnetNetwork, chainId);
        if (!tokens.includes(metadata.moto)) {
            tokens.push(metadata.moto);
        }

        if (!tokens.includes(metadata.wbtc)) {
            tokens.push(metadata.wbtc);
        }
    } catch (e) {
        //
    }
}

export function OPNetList() {
    const navigate = useNavigate();
    const wallet = useWallet();
    const currentAccount = useCurrentAccount();

    const [tokens, setTokens] = useState<any[]>([]);
    const [total, setTotal] = useState(-1);
    const [pagination, _setPagination] = useState({ currentPage: 1, pageSize: 100 });
    const [importTokenBool, setImportTokenBool] = useState(false);

    const tools = useTools();
    const fetchData = async () => {
        try {
            setTotal(-1);
            await wallet.getNetworkType();

            // await wallet.changeAddressType(AddressType.P2TR);
            const getChain = await wallet.getChainType();
            Web3API.setNetwork(getChain);

            const tokensImported = localStorage.getItem('tokensImported_' + getChain);
            let parsedTokens: string[] = [];
            if (tokensImported) {
                parsedTokens = JSON.parse(tokensImported);
            }

            const currentNetwork = await wallet.getNetworkType();
            pushDefaultTokens(parsedTokens, getChain, currentNetwork);

            if (parsedTokens.length) {
                localStorage.setItem('tokensImported_' + getChain, JSON.stringify(parsedTokens));
            }

            const tokenBalances: OpNetBalance[] = [];
            for (let i = 0; i < parsedTokens.length; i++) {
                try {
                    const tokenAddress = parsedTokens[i];
                    const provider: JSONRpcProvider = Web3API.provider;

                    const contract: IOP_20Contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, provider);
                    const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(
                        tokenAddress
                    );

                    if (contractInfo?.name === 'Generic Contract') {
                        tools.toastError(`Invalid Token ${tokenAddress}`);
                        parsedTokens.splice(i, 1);
                        localStorage.setItem('tokensImported_' + getChain, JSON.stringify(parsedTokens));
                        i--;
                        continue;
                    }

                    const balance = await contract.balanceOf(currentAccount.address);
                    if (!('error' in balance)) {
                        tokenBalances.push({
                            address: tokenAddress,
                            name: contractInfo?.name || '',
                            amount: BigInt(balance.decoded[0].toString()),
                            divisibility: contractInfo?.decimals || 8,
                            symbol: contractInfo?.symbol,
                            logo: contractInfo?.logo
                        });
                    }
                } catch (e) {
                    console.log(`Error processing token at index ${i}:`, e, parsedTokens[i]);
                    parsedTokens.splice(i, 1);
                    localStorage.setItem('tokensImported_' + getChain, JSON.stringify(parsedTokens));
                    i--;
                }
            }
            setTokens(tokenBalances);
            setTotal(1);
        } catch (e) {
            console.log(e);
            tools.toastError((e as Error).message);
        } finally {
            tools.showLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination, currentAccount.address]);

    if (total === -1) {
        return (
            <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
                <LoadingOutlined />
            </Column>
        );
    }

    // if (total === 0) {
    //   return (
    //     <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
    //       {data}
    //     </Column>
    //   );
    // }
    const $footerBaseStyle = {
        display: 'block',
        minHeight: 20,
        paddingBottom: 10,
        fontSize: 12,
        cursor: 'pointer'
    } as CSSProperties;
    const $opnet = {
        display: 'block',
        minHeight: 100
    } as CSSProperties;
    const $btnStyle = {
        width: '33%',
        fontSize: '10px'
    } as CSSProperties;
    const $style = Object.assign({}, $footerBaseStyle);
    const $style2 = Object.assign({}, $opnet);
    return (
        <div>
            <Row justifyBetween mt="lg">
                <>
                    <Button
                        text="SWAP"
                        preset="primary"
                        icon="send"
                        onClick={() => {
                            navigate('Swap', {});
                        }}
                        full
                    />
                </>
            </Row>
            <br />
            <BaseView style={$style2}>
                {total === 0 ? (
                    <>Empty</>
                ) : (
                    <>
                        {tokens.map((data, index) => {
                            return (
                                <div key={index}>
                                    <OpNetBalanceCard
                                        key={index}
                                        tokenBalance={data}
                                        onClick={() => {
                                            navigate('OpNetTokenScreen', {
                                                address: data.address
                                            });
                                        }}
                                    />
                                    <br />
                                </div>
                            );
                        })}
                    </>
                )}
            </BaseView>
            <BaseView style={$style}>
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
                        onClick={() => {
                            chrome.tabs.create({
                                url: chrome.runtime.getURL('/index.html#/opnet/deploy-contract')
                            });
                        }}></Button>
                </Row>
            </BaseView>
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
