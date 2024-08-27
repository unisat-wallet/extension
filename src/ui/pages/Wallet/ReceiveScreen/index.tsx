import QRCode from 'qrcode.react';

import { AddressBar, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import { sizes } from '@/ui/theme/spacing';

import './index.less';

export default function ReceiveScreen() {
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const chain = useChain();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Address"
      />
      <Content>
        <Column gap="xl" mt="lg">
          <Column
            justifyCenter
            rounded
            style={{ backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', padding: 10 }}>
            <QRCode
              value={address || ''}
              renderAs="svg"
              size={sizes.qrcode}
              imageRendering={chain.icon}
              imageSettings={{
                src: chain.icon,
                width: 30,
                height: 30,
                excavate: true
              }}></QRCode>
          </Column>

          <Row justifyCenter>
            <Icon icon="user" />
            <Text preset="regular-bold" text={currentAccount?.alianName} />
          </Row>
          <AddressBar />
        </Column>
      </Content>
    </Layout>
  );
}
