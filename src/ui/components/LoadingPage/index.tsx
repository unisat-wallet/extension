import { Spin } from 'antd';

import { Content, Layout } from '@/ui/components';

export default function LoadingPage() {
  return (
    <Layout>
      <Content preset="middle" bg="background">
        <Spin size="large" />
      </Content>
    </Layout>
  );
}
