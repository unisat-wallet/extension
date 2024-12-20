 
import { useState } from 'react';

import { Button, Column, Content, Layout, Logo, Row, Text } from '@/ui/components';
import { useWallet } from '@/ui/utils';

import { RouteTypes, useNavigate } from '../MainRoute';
import { ConnectHardwareModal } from './ConnectHardwareModal';

export default function WelcomeScreen() {
    const navigate = useNavigate();
    const wallet = useWallet();

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
                            text={
                                'A browser extension for managing tokens and interacting with apps on the OP_NET Bitcoin Layer 1 Metaprotocol.'
                            }
                            preset="sub"
                            textCenter
                        />

                        <Button
                            text="Create new wallet"
                            preset="primary"
                            onClick={async () => {
                                const isBooted = await wallet.isBooted();
                                if (isBooted) {
                                    navigate(RouteTypes.CreateHDWalletScreen, { isImport: false });
                                } else {
                                    navigate(RouteTypes.CreatePasswordScreen, { isNewAccount: true });
                                }
                            }}
                        />
                        <Button
                            text="I already have a wallet"
                            preset="default"
                            onClick={async () => {
                                const isBooted = await wallet.isBooted();
                                if (isBooted) {
                                    navigate(RouteTypes.CreateHDWalletScreen, { isImport: true });
                                } else {
                                    navigate(RouteTypes.CreatePasswordScreen, { isNewAccount: false });
                                }
                            }}
                        />
                        <Button
                            text="Connect to Hardware Wallet"
                            preset="default"
                            onClick={() => {
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
