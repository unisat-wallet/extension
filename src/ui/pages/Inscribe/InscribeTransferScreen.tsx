import { Button, Column, Content, Footer, Header, Input, Layout, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useWallet } from '@/ui/utils';

export default function InscribeTransferScreen() {
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

            <Column>
              <Text text="Available" color="textDim" />
              <Input preset="amount" />
            </Column>

            <Column>
              <Text text="Fee Rate" color="textDim" />
              <FeeRateBar
                onChange={() => {
                  // todo
                }}
              />
            </Column>
          </Column>

          <Button text="Inscribe TRANSFER" preset="primary" />
        </Column>
      </Content>
      <Footer />
    </Layout>
  );
}
