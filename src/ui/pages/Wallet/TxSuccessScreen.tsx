import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { spacing } from '@/ui/theme/spacing';
import { useLocationState } from '@/ui/utils';
import { Address } from '@btc-vision/bsi-binary';

interface LocationState {
  txid: string;
  contractAddress?: Address;
}

export default function TxSuccessScreen() {
  const { txid, contractAddress } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const blockstreamUrl = useBlockstreamUrl();
console.log(contractAddress);
  return (
    <Layout>
      <Header />

      <Content style={{ gap: spacing.small }}>
        <Column justifyCenter mt="xxl" gap="xl">
          <Row justifyCenter>
            <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
          </Row>

          <Text preset="title" text="Payment Sent" textCenter />
          <Text preset="sub" text="Your transaction has been successfully sent" color="textDim" textCenter />

          <Row
            justifyCenter
            onClick={() => {
              window.open(`${blockstreamUrl}/tx/${txid}`);
            }}>
            <Icon icon="eye" color="textDim" />
            <Text preset="regular-bold" text="View on Block Explorer" color="textDim" />
          </Row>

          {
            contractAddress !== undefined ? (
              <Row
                justifyCenter
                onClick={() => {
                  window.open(`${blockstreamUrl}/address/${contractAddress}`);
                }}>
                <Text preset="sub-bold" text={`Contract Address: ${contractAddress}`} color="textDim"></Text>
              </Row>
            ) : null
          }
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
}
