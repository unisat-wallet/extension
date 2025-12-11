import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { CloseOutlined } from '@ant-design/icons';
import { useDevice, useI18n, useNavigation, useTools, useWallet } from '@unisat/wallet-state';

import { HARDWARE_WALLETS, HardwareWalletType } from '@unisat/wallet-shared';
import { useNavigate } from '../MainRoute';

function WalletItem(props: { walletType: HardwareWalletType; onClick?: () => void; disabled?: boolean }) {
  const walletInfo = HARDWARE_WALLETS[props.walletType];
  const tools = useTools();
  const { t } = useI18n();

  return (
    <Card
      style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, opacity: props.disabled ? 0.4 : 1 }}
      mt="lg"
      onClick={() => {
        if (props.disabled) {
          tools.toast(t('coming_soon'));
        } else {
          props.onClick && props.onClick();
        }
      }}>
      <Row fullX>
        <Row itemsCenter>
          <Image src={IMAGE_SOURCE_MAP[walletInfo.name]} size={30} />
          <Text text={walletInfo.name} />
        </Row>
      </Row>
    </Card>
  );
}

export const ConnectHardwareModal = ({ onClose }: { onClose: () => void }) => {
  const wallet = useWallet();

  const { isExtensionInExpandView } = useDevice();
  const nav = useNavigation();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <BottomModal onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
          <Row />
          <Text text={t('connect_to_hardware_wallet')} textCenter size="md" />
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
            text={t('hardware_wallet_feature_is_experimental_use_it_with_caution_as_potential_issues_may_arise')}
          />

          <WalletItem
            walletType={HardwareWalletType.Keystone}
            onClick={async () => {
              const isBooted = await wallet.isBooted();
              if (!isExtensionInExpandView) {
                if (isBooted) {
                  nav.navToUrl('#/account/create-keystone-wallet');
                } else {
                  nav.navigate('CreatePasswordScreen', { isKeystone: true });
                }
                return;
              }
              if (isBooted) {
                nav.navigate('CreateKeystoneWalletScreen');
              } else {
                nav.navigate('CreatePasswordScreen', { isKeystone: true });
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
