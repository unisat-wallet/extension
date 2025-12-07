import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { spacing } from '@/ui/theme/spacing';
import { useI18n, useNavigation } from '@unisat/wallet-state';

interface LocationState {
  txid: string;
}

export default function TxSuccessScreen() {
  const nav = useNavigation();
  const { txid } = nav.getRouteState<LocationState>();
  const { t } = useI18n();

  return (
    <Layout>
      <Header />

      <Content style={{ gap: spacing.small }}>
        <Column justifyCenter mt="xxl" gap="xl">
          <Row justifyCenter>
            <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
          </Row>

          <Text preset="title" text={t('tx_sent_title')} textCenter />
          <Text preset="sub" text={t('tx_sent_desc')} color="textDim" textCenter />

          <Row
            justifyCenter
            onClick={() => {
              nav.navToExplorerTx(txid);
            }}>
            <Icon icon="eye" color="textDim" />
            <Text preset="regular-bold" text={t('view_on_block_explorer')} color="textDim" />
          </Row>
        </Column>
      </Content>
      <Footer>
        <Button
          full
          text={t('done')}
          onClick={() => {
            nav.navigate('MainScreen');
          }}
        />
      </Footer>
    </Layout>
  );
}
