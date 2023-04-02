import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useWallet } from '@/ui/utils';

export default function BRC20SendScreen() {
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
            <Text text="Inscribe TRANSFER" preset="title-bold" textCenter my="lg" />

            <Row justifyBetween>
              <Text text="Transfer Amount" color="textDim" />
              <Text text="2000 PEPE" />
            </Row>

            <Column>
              <Text text="TRANSFER Inscriptions" color="textDim" />
              <InscriptionPreview preset="large" />
            </Column>
            <Button text="Inscribe TRANSFER" />

            <Row justifyBetween>
              <Text text="Available" color="textDim" />
              <Text text="1,000,000 PEPE" />
            </Row>
          </Column>

          <Button text="Next" preset="primary" />
        </Column>
      </Content>
      <Footer />
    </Layout>
  );
}
