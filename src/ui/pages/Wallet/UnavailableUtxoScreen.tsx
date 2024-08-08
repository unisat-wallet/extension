import { Checkbox } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { UNCONFIRMED_HEIGHT } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import Arc20PreviewCard from '@/ui/components/Arc20PreviewCard';
import AssetTag from '@/ui/components/AssetTag';
import { Empty } from '@/ui/components/Empty';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useBlockstreamUrl, useBTCUnit, useOrdinalsWebsite } from '@/ui/state/settings/hooks';
import { useSetSpendUnavailableUtxosCallback } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount, shortUtxo, useWallet } from '@/ui/utils';
import { UnspentOutput } from '@unisat/wallet-sdk';

type UnavailableUnspentOutput = UnspentOutput & {
    height?: number;
};
export default function UnavailableUtxoScreen() {
    const wallet = useWallet();
    const unitBtc = useBTCUnit();

    const [utxos, setUtxos] = useState<UnavailableUnspentOutput[]>([]);

    const [selectedUtxoIds, setSelectedUtxoIds] = useState({});

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        wallet.getUnavailableUtxos().then((res) => {
            setUtxos(res);
            setLoading(false);
        });
    }, []);

    const blockstreamUrl = useBlockstreamUrl();

    const setSpendUnavailableUtxos = useSetSpendUnavailableUtxosCallback();

    const selectedCount = useMemo(() => {
        return Object.keys(selectedUtxoIds).filter((key) => selectedUtxoIds[key]).length;
    }, [selectedUtxoIds]);

    const ordinalsWebsite = useOrdinalsWebsite();
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Unavaiable"
            />
            <Content>
                {loading ? (
                    <Loading />
                ) : (
                    <Column>
                        {utxos.length > 0 ? (
                            utxos.map((item, index) => {
                                const selected = selectedUtxoIds[item.txid + '' + item.vout];
                                return (
                                    <Card
                                        key={item.txid + '' + item.vout}
                                        style={{
                                            flexDirection: 'column',
                                            borderColor: selected ? 'gold' : 'transparent',
                                            borderWidth: 1
                                        }}>
                                        <Row full justifyBetween itemsCenter>
                                            <Row itemsCenter>
                                                <Text
                                                    text={shortUtxo(item.txid, item.vout)}
                                                    preset="link"
                                                    style={{
                                                        color: '#65D5F0'
                                                    }}
                                                    onClick={() => {
                                                        window.open(
                                                            `${blockstreamUrl}/tx/${item.txid}#vout=${item.vout}`
                                                        );
                                                    }}
                                                />
                                            </Row>

                                            <Row>
                                                {item.inscriptions.length > 0 ? <AssetTag type="Inscription" /> : null}
                                                {item.atomicals.length > 0 ? <AssetTag type="ARC20" /> : null}
                                                {item.height === UNCONFIRMED_HEIGHT ? (
                                                    <AssetTag type="Unconfirmed" />
                                                ) : null}
                                            </Row>
                                        </Row>
                                        <Row full style={{ borderBottomWidth: 1, borderColor: colors.border }}></Row>

                                        {item.inscriptions.length > 0 ? (
                                            <Row overflowX fullX>
                                                {item.inscriptions.map((w) => (
                                                    <InscriptionPreview
                                                        key={w.inscriptionId}
                                                        data={w as any}
                                                        preset="small"
                                                        onClick={() => {
                                                            window.open(
                                                                `${ordinalsWebsite}/inscription/${w.inscriptionId}`
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </Row>
                                        ) : null}
                                        {item.inscriptions.length > 0 ? (
                                            <Row
                                                full
                                                style={{ borderBottomWidth: 1, borderColor: colors.border }}></Row>
                                        ) : null}

                                        {item.atomicals.length > 0 ? (
                                            <Row overflowX fullX>
                                                {item.atomicals.map((w) => (
                                                    <Arc20PreviewCard
                                                        key={w.ticker}
                                                        ticker={w.ticker || ''}
                                                        amt={item.satoshis}
                                                    />
                                                ))}
                                            </Row>
                                        ) : null}
                                        {item.atomicals.length > 0 ? (
                                            <Row
                                                full
                                                style={{ borderBottomWidth: 1, borderColor: colors.border }}></Row>
                                        ) : null}

                                        <Row full justifyBetween>
                                            <Row itemsCenter>
                                                <Text text={satoshisToAmount(item.satoshis)} preset="bold" />
                                                <Text text={unitBtc} preset="sub" />
                                            </Row>
                                            <Row>
                                                <Text text={''} preset="sub" />

                                                <Checkbox
                                                    onChange={(e) => {
                                                        selectedUtxoIds[item.txid + '' + item.vout] = e.target.checked;
                                                        setSelectedUtxoIds(Object.assign({}, selectedUtxoIds));
                                                    }}
                                                    style={{ fontSize: fontSizes.sm }}></Checkbox>
                                            </Row>
                                        </Row>
                                    </Card>
                                );
                            })
                        ) : (
                            <Empty />
                        )}
                    </Column>
                )}
            </Content>
            {selectedCount > 0 ? (
                <Footer>
                    <Row full>
                        <Button
                            text={`Spend (${selectedCount})`}
                            full
                            preset="primary"
                            onClick={() => {
                                setSpendUnavailableUtxos(
                                    utxos.filter((item) => selectedUtxoIds[item.txid + '' + item.vout])
                                );
                                window.history.go(-1);
                            }}
                        />
                    </Row>
                </Footer>
            ) : null}
        </Layout>
    );
}
