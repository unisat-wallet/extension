/* eslint-disable quotes */
import { useState } from 'react';

import { Button, Column, Content, Layout, Logo, Row, Text } from '@/ui/components';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';
import { ConnectHardwareModal } from './ConnectHardwareModal';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const isInTab = useExtensionIsInTab();

  const [connectHardwareModalVisible, setConnectHardwareModalVisible] = useState(false);

  return (
    <Layout>
      <Content preset="middle">
        <Column fullX>
          <Row justifyCenter>
            <Logo preset="large" />
          </Row>
          <Column gap="xl" mt="xxl">
            <Text
              text={"Inscribe and store your inscriptions in the world's first Open Source Chrome wallet for Ordinals!"}
              preset="sub"
              textCenter
            />

            <Button
              text="Create new wallet"
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
              text="I already have a wallet"
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
              text="Connect to Hardware Wallet"
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
