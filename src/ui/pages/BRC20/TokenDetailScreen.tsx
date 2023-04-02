import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';

import { Header, Text } from '@/ui/components';
import BRC20CardStack from '@/ui/components/BRC20CardStack';

export default function TokenDetailScreen() {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Text text="1,008,000 PEPE" />

        <BRC20CardStack />
      </Content>
    </Layout>
  );
}
