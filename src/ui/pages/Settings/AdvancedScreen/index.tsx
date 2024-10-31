import { useEffect, useState } from 'react';

import { Content, Header, Layout } from '@/ui/components';

import { EnableSignDataCard } from './EnableSignData';
import { LockTimeCard } from './LockTime';
import { UnconfirmedBalanceCard } from './UnconfirmBalance';

export default function AdvancedScreen() {
  const [init, setInit] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setInit(true);
    }, 300);
  }, []);

  if (!init) {
    return <Layout></Layout>;
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Advanced"
      />
      <Content>
        <UnconfirmedBalanceCard />
        <EnableSignDataCard />
        <LockTimeCard />
      </Content>
    </Layout>
  );
}
