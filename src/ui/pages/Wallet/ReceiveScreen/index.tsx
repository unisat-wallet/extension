import QRCode from 'qrcode.react';

import { AddressBar, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { sizes } from '@/ui/theme/spacing';
import { useAccountAddress, useChain, useCurrentAccount, useI18n } from '@unisat/wallet-state';

import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import './index.less';

export default function ReceiveScreen() {
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const chain = useChain();
  const { t } = useI18n();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('address_label')}
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
              imageRendering={IMAGE_SOURCE_MAP[chain.icon]}
              imageSettings={{
                src: IMAGE_SOURCE_MAP[chain.icon],
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
