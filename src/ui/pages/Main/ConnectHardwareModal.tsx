import { HARDWARE_WALLETS, HardwareWalletType } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

import { RouteTypes, useNavigate } from '../MainRoute';

function WalletItem(props: { walletType: HardwareWalletType; onClick?: () => void; disabled?: boolean }) {
    const walletInfo = HARDWARE_WALLETS[props.walletType];
    const tools = useTools();

    return (
        <Card
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, opacity: props.disabled ? 0.4 : 1 }}
            mt="lg"
            onClick={() => {
                if (props.disabled) {
                    tools.toast('Coming soon');
                } else {
                    props.onClick?.();
                }
            }}>
            <Row fullX>
                <Row itemsCenter>
                    <Image src={walletInfo.img} size={30} />
                    <Text text={walletInfo.name} />
                </Row>
            </Row>
        </Card>
    );
}

export const ConnectHardwareModal = ({ onClose }: { onClose: () => void }) => {
    const wallet = useWallet();

    const isInTab = useExtensionIsInTab();
    const navigate = useNavigate();

    return (
        <BottomModal onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
                    <Row />
                    <Text text="Connect to Hardware Wallet" textCenter size="md" />
                    <Row
                        onClick={() => {
                            onClose();
                        }}>
                        <CloseOutlined />
                    </Row>
                </Row>

                <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

                <Column gap="zero" mt="sm" mb="lg">
                    <Text
                        size="sm"
                        color="textDim"
                        text={
                            'The hardware wallet feature is experimental. Use it with caution as potential issues may arise'
                        }
                    />

                    <WalletItem
                        walletType={HardwareWalletType.Keystone}
                        onClick={async () => {
                            const isBooted = await wallet.isBooted();
                            if (!isInTab) {
                                if (isBooted) {
                                    window.open('#/account/create-keystone-wallet');
                                } else {
                                    window.open('#/account/create-password?isKeystone=true');
                                }
                                return;
                            }
                            if (isBooted) {
                                navigate(RouteTypes.CreateKeystoneWalletScreen);
                            } else {
                                navigate(RouteTypes.CreatePasswordScreen, { isKeystone: true });
                            }
                        }}
                    />

                    <WalletItem walletType={HardwareWalletType.Ledger} disabled />
                    <WalletItem walletType={HardwareWalletType.Trezor} disabled />
                </Column>
            </Column>
        </BottomModal>
    );
};
