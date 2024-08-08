import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressRunesTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { TickUsdWithoutPrice } from '@/ui/components/TickUsd';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBlockstreamUrl, useOrdinalsWebsite, useUnisatWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, showLongNumber, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
    runeid: string;
}

export default function RunesTokenScreen() {
    const { runeid } = useLocationState<LocationState>();
    const [tokenSummary, setTokenSummary] = useState<AddressRunesTokenSummary>({
        runeBalance: {
            runeid: '',
            rune: '',
            spacedRune: '',
            amount: '',
            symbol: '',
            divisibility: 0
        },
        runeInfo: {
            rune: '',
            runeid: '',
            spacedRune: '',
            symbol: '',
            premine: '',
            mints: '',
            divisibility: 0,
            etching: '',
            terms: {
                amount: '',
                cap: '',
                heightStart: 0,
                heightEnd: 0,
                offsetStart: 0,
                offsetEnd: 0
            },
            number: 0,
            height: 0,
            txidx: 0,
            timestamp: 0,
            burned: '',
            holders: 0,
            transactions: 0,
            mintable: false,
            remaining: '',
            start: 0,
            end: 0,
            supply: '0',
            parent: ''
        }
    });

    const wallet = useWallet();

    const account = useCurrentAccount();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        wallet.getAddressRunesTokenSummary(account.address, runeid).then((tokenSummary) => {
            setTokenSummary(tokenSummary);
            setLoading(false);
        });
    }, []);

    const navigate = useNavigate();

    const unisatWebsite = useUnisatWebsite();

    const enableMint = tokenSummary.runeInfo.mintable;

    const enableTransfer = useMemo(() => {
        let enable = false;
        if (tokenSummary.runeBalance.amount !== '0') {
            enable = true;
        }
        return enable;
    }, [tokenSummary]);

    const tools = useTools();

    const ordinalsWebsite = useOrdinalsWebsite();

    const mempoolWebsite = useBlockstreamUrl();
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
                            <Text
                                text={`${runesUtils.toDecimalAmount(
                                    tokenSummary.runeBalance.amount,
                                    tokenSummary.runeBalance.divisibility
                                )}`}
                                preset="bold"
                                textCenter
                                size="xxl"
                                wrap
                                digital
                            />
                            <BRC20Ticker tick={tokenSummary.runeBalance.symbol} preset="lg" />
                        </Row>
                        <Row justifyCenter fullX>
                            <TickUsdWithoutPrice
                                tick={tokenSummary.runeInfo.spacedRune}
                                balance={runesUtils.toDecimalAmount(
                                    tokenSummary.runeBalance.amount,
                                    tokenSummary.runeBalance.divisibility
                                )}
                                type={'runes'}
                                size={'md'}
                            />
                        </Row>

                        <Row justifyBetween mt="lg">
                            <Button
                                text="Mint"
                                preset="primary"
                                style={!enableMint ? { backgroundColor: 'grey' } : {}}
                                disabled={!enableMint}
                                icon="pencil"
                                onClick={(e) => {
                                    window.open(
                                        `${unisatWebsite}/runes/inscribe?tab=mint&rune=${tokenSummary.runeInfo.rune}`
                                    );
                                }}
                                full
                            />

                            <Button
                                text="Send"
                                preset="primary"
                                icon="send"
                                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                                disabled={!enableTransfer}
                                onClick={(e) => {
                                    navigate('SendRunesScreen', {
                                        runeBalance: tokenSummary.runeBalance,
                                        runeInfo: tokenSummary.runeInfo
                                    });
                                }}
                                full
                            />
                        </Row>
                    </Column>

                    <Text
                        text={tokenSummary.runeInfo.spacedRune}
                        preset="title-bold"
                        onClick={() => {
                            copyToClipboard(tokenSummary.runeInfo.spacedRune).then(() => {
                                tools.toastSuccess('Copied');
                            });
                        }}></Text>
                    {tokenSummary.runeLogo ? (
                        <Row>
                            <InscriptionPreview data={tokenSummary.runeLogo} preset="small" asLogo />
                        </Row>
                    ) : null}

                    <Column gap="lg">
                        <Section title="runeid" value={tokenSummary.runeInfo.runeid} />

                        <Section title="mints" value={showLongNumber(tokenSummary.runeInfo.mints)} />

                        <Section
                            title="supply"
                            value={`${showLongNumber(
                                runesUtils.toDecimalAmount(
                                    tokenSummary.runeInfo.supply,
                                    tokenSummary.runeInfo.divisibility
                                )
                            )} ${tokenSummary.runeInfo.symbol}`}
                        />

                        <Section
                            title="premine"
                            value={`${showLongNumber(
                                runesUtils.toDecimalAmount(
                                    tokenSummary.runeInfo.premine,
                                    tokenSummary.runeInfo.divisibility
                                )
                            )} ${tokenSummary.runeInfo.symbol}`}
                        />

                        <Section
                            title="burned"
                            value={`${showLongNumber(
                                runesUtils.toDecimalAmount(
                                    tokenSummary.runeInfo.burned,
                                    tokenSummary.runeInfo.divisibility
                                )
                            )} ${tokenSummary.runeInfo.symbol}`}
                        />

                        <Section title="divisibility" value={tokenSummary.runeInfo.divisibility} />

                        <Section title="symbol" value={tokenSummary.runeInfo.symbol} />

                        <Section title="holders" value={showLongNumber(tokenSummary.runeInfo.holders)} />

                        <Section title="transactions" value={showLongNumber(tokenSummary.runeInfo.transactions)} />

                        <Section
                            title="etching"
                            value={tokenSummary.runeInfo.etching}
                            link={`${mempoolWebsite}/tx/${tokenSummary.runeInfo.etching}`}
                        />

                        {tokenSummary.runeInfo.parent ? (
                            <Section
                                title="parent"
                                value={tokenSummary.runeInfo.parent}
                                link={`${ordinalsWebsite}/inscription/${tokenSummary.runeInfo.parent}`}
                            />
                        ) : null}
                    </Column>
                </Content>
            )}
        </Layout>
    );
}

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
    const tools = useTools();
    return (
        <Column>
            <Text text={title} preset="sub" />
            <Text
                text={value}
                preset={link ? 'link' : 'regular'}
                size="xs"
                wrap
                onClick={() => {
                    if (link) {
                        window.open(link);
                    } else {
                        copyToClipboard(value).then(() => {
                            tools.toastSuccess('Copied');
                        });
                    }
                }}
            />
        </Column>
    );
}
