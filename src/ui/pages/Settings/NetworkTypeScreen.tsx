import { NETWORK_TYPES } from '@/shared/constant';
import { Content, Header, Layout, Icon, Column, Row, Card, Text } from '@/ui/components';
import { useChangeNetworkTypeCallback, useNetworkType } from '@/ui/state/settings/hooks';

export default function NetworkTypeScreen() {
  const networkType = useNetworkType();
  const changeNetworkType = useChangeNetworkTypeCallback();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Network"
      />
      <Content>
        <Column>
          {NETWORK_TYPES.map((item, index) => {
            return (
              <Card
                key={index}
                onClick={async () => {
                  await changeNetworkType(item.value);
                  window.location.reload();
                }}>
                <Row full justifyBetween itemsCenter>
                  <Row itemsCenter>
                    <Text text={item.label} preset="regular-bold" />
                  </Row>
                  <Column>{item.value == networkType && <Icon icon="check" />}</Column>
                </Row>
              </Card>
            );
          })}
        </Column>
      </Content>
    </Layout>
  );
}
