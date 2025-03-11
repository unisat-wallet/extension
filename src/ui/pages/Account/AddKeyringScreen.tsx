import { Card, Column, Content, Header, Layout, Text } from '@/ui/components';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useI18n } from '@/ui/hooks/useI18n';

import { useNavigate } from '../MainRoute';

export default function AddKeyringScreen() {
  const navigate = useNavigate();
  const isInTab = useExtensionIsInTab();
  const { t } = useI18n();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('create_a_new_wallet')}
      />
      <Content>
        <Column>
          <Text text={t('create_wallet')} preset="regular-bold" />

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: false });
            }}>
            <Column full justifyCenter>
              <Text text={t('create_with_mnemonics_12words')} size="sm" />
            </Column>
          </Card>

          <Text text={t('restore_wallet')} preset="regular-bold" mt="lg" />

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: true });
            }}>
            <Column full justifyCenter>
              <Text text={t('restore_from_mnemonics_12words24words')} size="sm" />
            </Column>
          </Card>

          <Card
            justifyCenter
            onClick={(e) => {
              navigate('CreateSimpleWalletScreen');
            }}>
            <Column full justifyCenter>
              <Text text={t('restore_from_single_private_key')} size="sm" />
            </Column>
          </Card>

          <Text text={t('connect_to_hardware_wallet')} preset="regular-bold" mt="lg" />

          <Card
            justifyCenter
            onClick={() => {
              if (isInTab) {
                navigate('CreateKeystoneWalletScreen');
              } else {
                window.open('#/account/create-keystone-wallet');
              }
            }}>
            <Column full justifyCenter>
              <Text text={t('keystone_wallet')} size="sm" />
            </Column>
          </Card>
        </Column>
      </Content>
    </Layout>
  );
}
