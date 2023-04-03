import { NETWORK_TYPES } from '@/shared/constant';
import { NetworkType } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useApproval } from '@/ui/utils';

interface Props {
  params: {
    data: {
      networkType: NetworkType;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function SwitchNetwork({ params: { data, session } }: Props) {
  const networkType = useNetworkType();
  const from = NETWORK_TYPES[networkType];
  const to = NETWORK_TYPES[data.networkType];

  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleConnect = async () => {
    resolveApproval();
  };

  return (
    <Layout>
      <Header>
        <WebsiteBar session={session} />
      </Header>
      <Content>
        <Column mt="lg">
          <Text text="Allow this site to switch the network?" textCenter preset="title-bold" mt="lg" />

          <Row justifyBetween itemsCenter mt="lg">
            <Card preset="style2" px="lg">
              <Text text={from.label} preset="title-bold" />
            </Card>
            <Text text=">" />
            <Card preset="style2" px="lg">
              <Text text={to.label} preset="title-bold" />
            </Card>
          </Row>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text="Cancel" preset="default" onClick={handleCancel} full />
          <Button text="Switch Network" preset="primary" onClick={handleConnect} full />
        </Row>
      </Footer>
    </Layout>
  );
}
