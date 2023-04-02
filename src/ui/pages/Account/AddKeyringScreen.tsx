import { Card, Column, Content, Header, Layout, Text } from '@/ui/components';

import { useNavigate } from '../MainRoute';

export default function AddKeyringScreen() {
  const navigate = useNavigate();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Create a new wallet"
      />
      <Content>
        <Column>
          <Text text="Create Wallet" preset="regular-bold" />

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: false });
            }}>
            <Column full justifyCenter>
              <Text text="Create with mnemonics (12-words)" size="sm" />
            </Column>
          </Card>

          <Text text="Restore Wallet" preset="regular-bold" mt="lg" />

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: true });
            }}>
            <Column full justifyCenter>
              <Text text="Restore from mnemonics (12-words)" size="sm" />
            </Column>
          </Card>

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateSimpleWalletScreen');
            }}>
            <Column full justifyCenter>
              <Text text="Restore from single private key" size="sm" />
            </Column>
          </Card>
        </Column>
      </Content>
    </Layout>
  );
}
