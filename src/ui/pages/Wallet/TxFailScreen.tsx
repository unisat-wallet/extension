import { Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { useI18n, useNavigation } from '@unisat/wallet-state';

export default function TxFailScreen() {
  const nav = useNavigation();
  const { error } = nav.getRouteState<{ error: string }>();
  const { t } = useI18n();

  return (
    <Layout>
      <Header onBack={() => nav.goBack()} />
      <Content>
        <Column justifyCenter mt="xxl" gap="xl">
          <Row justifyCenter>
            <Icon icon="delete" size={50} />
          </Row>

          <Text preset="title" text={t('payment_failed')} textCenter />
          <Text preset="sub" style={{ color: colors.red }} text={error} textCenter />
        </Column>
      </Content>
    </Layout>
  );
}
