import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { spacing } from '@/ui/theme/spacing';
import { useLocationState } from '@/ui/utils';

interface LocationState {
  txid: string;
}

export default function TxSuccessScreen() {
  const { txid } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const txidUrl = useTxExplorerUrl(txid);
  const { t } = useI18n();

  return (
    <Layout>
      <Header />

      <Content style={{ gap: spacing.small }}>
        <Column justifyCenter mt="xxl" gap="xl">
          <Row justifyCenter>
            <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
          </Row>

          <Text preset="title" text={t('payment_sent')} textCenter />
          <Text preset="sub" text={t('your_transaction_has_been_successfully_sent')} color="textDim" textCenter />

          <Row
            justifyCenter
            onClick={() => {
              window.open(`${txidUrl}`);
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
            navigate('MainScreen');
          }}
        />
      </Footer>
    </Layout>
  );
}
