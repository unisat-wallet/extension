import { Checkbox } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { UNCONFIRMED_HEIGHT } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import AssetTag from '@/ui/components/AssetTag';
import { Empty } from '@/ui/components/Empty';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { useSetSpendUnavailableUtxosCallback } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount, shortUtxo, useWallet } from '@/ui/utils';
import { UnspentOutput } from '@btc-vision/wallet-sdk';

type UnavailableUnspentOutput = UnspentOutput & {
    height?: number;
};
export default function UnavailableUtxoScreen() {
    const wallet = useWallet();
    const unitBtc = useBTCUnit();

    const [utxos, setUtxos] = useState<UnavailableUnspentOutput[]>([]);
    const [selectedUtxoIds, setSelectedUtxoIds] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        wallet
            .getUnavailableUtxos()
            .then((res) => {
                setUtxos(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const setSpendUnavailableUtxos = useSetSpendUnavailableUtxosCallback();
    const selectedCount = useMemo(() => {
        return Object.keys(selectedUtxoIds).filter((key) => selectedUtxoIds[key]).length;
    }, [selectedUtxoIds]);

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
                            utxos.map((item) => {
                                const key = `${item.txid}${item.vout}`;

                                const selected = selectedUtxoIds[key];
                                return (
                                    <Card
                                        key={key}
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
                                                        //window.open(
                                                        //    `${blockstreamUrl}/tx/${item.txid}#vout=${item.vout}`
                                                        //);
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

                                        <Row full justifyBetween>
                                            <Row itemsCenter>
                                                <Text text={satoshisToAmount(item.satoshis)} preset="bold" />
                                                <Text text={unitBtc} preset="sub" />
                                            </Row>
                                            <Row>
                                                <Text text={''} preset="sub" />

                                                <Checkbox
                                                    onChange={(e) => {
                                                        selectedUtxoIds[key] = e.target.checked;
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
                                    utxos.filter((item) => selectedUtxoIds[`${item.txid}${item.vout}`])
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
