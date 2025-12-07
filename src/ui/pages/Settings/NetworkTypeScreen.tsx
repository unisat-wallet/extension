import { Card, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useChainType, useChangeChainTypeCallback, useI18n, useReloadAccounts, useTools } from '@unisat/wallet-state';

import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import { CHAINS } from '@unisat/wallet-shared';
import { useNavigate } from '../MainRoute';

export default function NetworkTypeScreen() {
  const chainType = useChainType();
  const changeChainType = useChangeChainTypeCallback();
  const reloadAccounts = useReloadAccounts();
  const tools = useTools();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('select_network')}
      />
      <Content>
        <Column>
          {CHAINS.map((item, index) => {
            return (
              <Card
                key={index}
                onClick={async () => {
                  if (item.disable) {
                    return tools.toastError(t('this_network_is_not_available'));
                  }
                  if (item.enum == chainType) {
                    return;
                  }
                  await changeChainType(item.enum);
                  reloadAccounts();
                  navigate('MainScreen');
                  tools.toastSuccess(`${t('changed_to_network')} ${item.label}`);
                }}>
                <Row full justifyBetween itemsCenter>
                  <Row itemsCenter>
                    <Image src={IMAGE_SOURCE_MAP[item.icon]} size={30} style={{ opacity: item.disable ? 0.7 : 1 }} />
                    <Text text={item.label} preset="regular-bold" color={item.disable ? 'textDim' : 'text'} />
                  </Row>
                  <Column>{item.enum == chainType && <Icon icon="check" />}</Column>
                </Row>
              </Card>
            );
          })}
        </Column>
      </Content>
    </Layout>
  );
}
