import { Spin } from 'antd';
import { useEffect, useState } from 'react';

import { Content, Header, Layout } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

import { EnableSignDataCard } from './EnableSignData';
import { LanguageCard } from './Language';
import { SecurityCard } from './SecurityCard';
import { UnconfirmedBalanceCard } from './UnconfirmBalance';

export default function AdvancedScreen() {
  const { t } = useI18n();
  const [init, setInit] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setInit(true);
    }, 300);
  }, []);

  if (!init) {
    return (
      <Layout>
        <Content preset="middle" bg="background">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('advanced')}
      />
      <Content>
        <LanguageCard />

        <SecurityCard />

        <UnconfirmedBalanceCard />

        <EnableSignDataCard />
      </Content>
    </Layout>
  );
}
