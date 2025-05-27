import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AlkanesInfo } from '@/shared/types';
import { Button, Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useWallet } from '@/ui/utils';

export default function AlkanesNFTScreen() {
  const { state } = useLocation();
  const props = state as {
    alkanesInfo: AlkanesInfo;
  };
  const { t } = useI18n();

  const alkanesInfo = props.alkanesInfo;

  const navigate = useNavigate();

  const [availableUtxo, setAvailableUtxo] = useState(0);
  const wallet = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      const utxos = await wallet.getAssetUtxosAlkanes(alkanesInfo.alkaneid);
      setAvailableUtxo(utxos.length);
    };
    fetchData();
  }, [wallet]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}>
        <Row>
          <Text text={`${alkanesInfo.name} `} />
        </Row>
      </Header>
      <Content>
        <Row justifyCenter>
          <AlkanesNFTPreview preset="large" alkanesInfo={alkanesInfo} />
        </Row>

        <Card style={{ borderRadius: 15 }}>
          <Column fullX my="sm">
            <Section title={t('name_label')} value={alkanesInfo.name} />
            <Line />

            <Section title={t('symbol_alkanes')} value={alkanesInfo.symbol} />
            <Line />
            <Section title={'Alkanes ID'} value={alkanesInfo.alkaneid} showCopyIcon />
          </Column>
        </Card>
        <Button
          text={t('send')}
          icon="send"
          preset="default"
          disabled={availableUtxo <= 0}
          onClick={(e) => {
            navigate('SendAlkanesNFTScreen', {
              alkanesInfo: alkanesInfo
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
