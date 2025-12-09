/* eslint-disable quotes */
import { useState } from 'react';

import { Button, Column, Content, Layout, Logo, Row, Text } from '@/ui/components';
import { useI18n, useWallet } from '@unisat/wallet-state';

import { useNavigate } from '../MainRoute';
import { ConnectHardwareModal } from './ConnectHardwareModal';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { t } = useI18n();

  const [connectHardwareModalVisible, setConnectHardwareModalVisible] = useState(false);

  return (
    <Layout>
      <Content preset="middle">
        <Column fullX>
          <Row justifyCenter>
            <Logo preset="large" />
          </Row>
          <Column gap="xl" mt="xxl">
            <Text text={t('welcome_screen_title')} preset="sub" textCenter />

            <Button
              text={t('create_new_wallet')}
              preset="primary"
              onClick={async () => {
                const isBooted = await wallet.isBooted();
                if (isBooted) {
                  navigate('CreateHDWalletScreen', { isImport: false });
                } else {
                  navigate('CreatePasswordScreen', { isNewAccount: true });
                }
              }}
            />
            <Button
              text={t('i_already_have_a_wallet')}
              preset="default"
              onClick={async () => {
                const isBooted = await wallet.isBooted();
                if (isBooted) {
                  navigate('CreateHDWalletScreen', { isImport: true });
                } else {
                  navigate('CreatePasswordScreen', { isNewAccount: false });
                }
              }}
            />
            <Button
              text={t('connect_to_hardware_wallet')}
              preset="default"
              onClick={async () => {
                setConnectHardwareModalVisible(true);
              }}
            />

            {connectHardwareModalVisible && (
              <ConnectHardwareModal
                onClose={() => {
                  setConnectHardwareModalVisible(false);
                }}
              />
            )}
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
