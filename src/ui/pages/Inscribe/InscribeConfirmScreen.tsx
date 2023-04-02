import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useWallet } from '@/ui/utils';

export default function InscribeConfirmScreen() {
  const isInTab = useExtensionIsInTab();

  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const account = useCurrentAccount();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Column full>
          <Column gap="lg" full>
            <Text text="Inscribe TRANSFER" preset="title-bold" textCenter marginY="lg" />

            <Column justifyCenter style={{ height: 200 }}>
              <Text text="1000PEPE" preset="title-bold" size="xxl" color="orange" textCenter />
            </Column>

            <Column>
              <Row justifyBetween>
                <Text text="Inscription Output Value" color="textDim" />
                <Text text="0.00012000 BTC" />
              </Row>
              <Row justifyBetween>
                <Text text="Network Fee" color="textDim" />
                <Text text="0.00012000 BTC" />
              </Row>
              <Row justifyBetween>
                <Text text="Service Fee" color="textDim" />
                <Text text="0.00012000 BTC" />
              </Row>
              <Row justifyBetween>
                <Text text="Total" color="orange" />
                <Text text="0.00012000 BTC" color="orange" />
              </Row>
            </Column>
          </Column>

          <Row>
            <Button text="Cancel" preset="default" full />
            <Button text="OK" preset="primary" full />
          </Row>
        </Column>
      </Content>
      <Footer />
    </Layout>
  );
}
