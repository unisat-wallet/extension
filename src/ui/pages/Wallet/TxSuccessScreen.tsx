import { Layout, Header, Content, Icon, Text, Column, Footer, Button, Row } from '@/ui/components';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { spacing } from '@/ui/theme/spacing';

export default () => {
  const bitcoinTx = useBitcoinTx();
  const navigate = useNavigate();
  const blockstreamUrl = useBlockstreamUrl();

  const ordinalsTx = useOrdinalsTx();
  const txid = ordinalsTx.txid || bitcoinTx.txid;
  return (
    <Layout>
      <Header />

      <Content style={{ gap: spacing.small }}>
        <Column justifyCenter>
          <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
          <Text preset="title" text="Payment Sent" textCenter />
          <Text preset="sub" text="Your transaction has been succesfully sent" color="textDim" textCenter />

          <Row
            onClick={() => {
              window.open(`${blockstreamUrl}/tx/${txid}`);
            }}>
            <Icon icon="eye" color="textDim" />
            <Text preset="regular-bold" text="View on Block Explorer" color="textDim" />
          </Row>
        </Column>
      </Content>
      <Footer>
        <Button
          full
          text="Done"
          onClick={() => {
            navigate('MainScreen');
          }}
        />
      </Footer>
    </Layout>
  );
};
