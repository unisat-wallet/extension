import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { brc20Utils } from '@/shared/lib/brc20-utils';
import { AddressTokenSummary, Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Empty } from '@/ui/components/Empty';
import { TickUsdWithoutPrice } from '@/ui/components/TickUsd';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useUnisatWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
    ticker: string;
}

export default function BRC20TokenScreen() {
    const { ticker } = useLocationState<LocationState>();

    const [tokenSummary, setTokenSummary] = useState<AddressTokenSummary>({
        tokenBalance: {
            ticker,
            overallBalance: '',
            availableBalance: '',
            transferableBalance: '',
            availableBalanceSafe: '',
            availableBalanceUnSafe: ''
        },
        tokenInfo: {
            totalSupply: '',
            totalMinted: '',
            decimal: 18,
            holder: '',
            inscriptionId: ''
        },
        historyList: [],
        transferableList: []
    });

    const wallet = useWallet();

    const account = useCurrentAccount();

    const [loading, setLoading] = useState(true);

    const [deployInscription, setDeployInscription] = useState<Inscription>();

    useEffect(() => {
        wallet.getBRC20Summary(account.address, ticker).then((tokenSummary) => {
            if (tokenSummary.tokenInfo.holder == account.address) {
                wallet
                    .getInscriptionInfo(tokenSummary.tokenInfo.inscriptionId)
                    .then((data) => {
                        setDeployInscription(data);
                    })
                    .finally(() => {
                        setTokenSummary(tokenSummary);
                        setLoading(false);
                    });
            } else {
                setTokenSummary(tokenSummary);
                setLoading(false);
            }
        });
    }, []);

    const balance = useMemo(() => {
        if (!tokenSummary) {
            return '--';
        }
        return tokenSummary?.tokenBalance.overallBalance;
    }, [tokenSummary]);

    const navigate = useNavigate();

    const unisatWebsite = useUnisatWebsite();

    const enableMint = useMemo(() => {
        let enable = false;
        if (brc20Utils.is5Byte(ticker)) {
            if (tokenSummary.tokenInfo.holder == account.address) {
                if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
                    enable = true;
                }
            }
        } else {
            if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
                enable = true;
            }
        }
        return enable;
    }, [tokenSummary]);

    const enableTransfer = useMemo(() => {
        let enable = false;
        if (tokenSummary.tokenBalance.overallBalance !== '0' && tokenSummary.tokenBalance.overallBalance !== '') {
            enable = true;
        }
        return enable;
    }, [tokenSummary]);

    const tools = useTools();
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
                            <Text text={`${balance}`} preset="bold" textCenter size="xxl" wrap digital />
                            <BRC20Ticker tick={ticker} preset="lg" />
                        </Row>
                        <Row justifyCenter fullX>
                            <TickUsdWithoutPrice tick={ticker} balance={balance} type={'brc20'} size={'md'} />
                        </Row>

                        <Row justifyBetween mt="lg">
                            <Button
                                text="MINT"
                                preset="primary"
                                style={!enableMint ? { backgroundColor: 'grey' } : {}}
                                disabled={!enableMint}
                                icon="pencil"
                                onClick={(e) => {
                                    window.open(`${unisatWebsite}/brc20/${encodeURIComponent(ticker)}`);
                                }}
                                full
                            />

                            <Button
                                text="TRANSFER"
                                preset="primary"
                                icon="send"
                                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                                disabled={!enableTransfer}
                                onClick={(e) => {
                                    // todo
                                    const defaultSelected = tokenSummary.transferableList.slice(0, 1);
                                    const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
                                    const selectedAmount = defaultSelected.reduce(
                                        (pre, cur) => new BigNumber(cur.amount).plus(pre),
                                        new BigNumber(0)
                                    );
                                    navigate('BRC20SendScreen', {
                                        tokenBalance: tokenSummary.tokenBalance,
                                        selectedInscriptionIds,
                                        selectedAmount: selectedAmount.toString()
                                    });
                                }}
                                full
                            />
                        </Row>
                    </Column>
                    <Column>
                        <Row justifyBetween>
                            <Text text="Transferable" preset="bold" size="md" />
                            <Row itemsCenter justifyCenter>
                                <Text
                                    text={`${tokenSummary.tokenBalance.transferableBalance}`}
                                    size="md"
                                    wrap
                                    digital
                                />
                                <BRC20Ticker tick={ticker} />
                            </Row>
                        </Row>
                        {tokenSummary.transferableList.length == 0 && !deployInscription && (
                            <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
                                {loading ? (
                                    <Icon>
                                        <LoadingOutlined />
                                    </Icon>
                                ) : (
                                    <Empty text="Empty" />
                                )}
                            </Column>
                        )}

                        <Row overflowX>
                            {deployInscription ? (
                                <BRC20Preview
                                    tick={ticker}
                                    inscriptionNumber={deployInscription.inscriptionNumber}
                                    timestamp={deployInscription.timestamp}
                                    type="DEPLOY"
                                    onClick={async () => {
                                        try {
                                            tools.showLoading(true);
                                            navigate('OrdinalsInscriptionScreen', {
                                                inscription: deployInscription,
                                                withSend: true
                                            });
                                        } catch (e) {
                                            console.log(e);
                                        } finally {
                                            tools.showLoading(false);
                                        }
                                    }}
                                />
                            ) : null}
                            {tokenSummary.transferableList.map((v) => (
                                <BRC20Preview
                                    key={v.inscriptionId}
                                    tick={ticker}
                                    balance={v.amount}
                                    inscriptionNumber={v.inscriptionNumber}
                                    timestamp={v.timestamp}
                                    confirmations={v.confirmations}
                                    type="TRANSFER"
                                    onClick={async () => {
                                        try {
                                            tools.showLoading(true);
                                            const data = await wallet.getInscriptionInfo(v.inscriptionId);
                                            navigate('OrdinalsInscriptionScreen', {
                                                inscription: data,
                                                withSend: true
                                            });
                                        } catch (e) {
                                            console.log(e);
                                        } finally {
                                            tools.showLoading(false);
                                        }
                                    }}
                                />
                            ))}
                        </Row>

                        {deployInscription || tokenSummary.transferableList.length > 0 ? (
                            <Text
                                text={'You may click on the inscription to send it directly.'}
                                preset="sub"
                                textCenter
                            />
                        ) : null}
                    </Column>
                </Content>
            )}
        </Layout>
    );
}
