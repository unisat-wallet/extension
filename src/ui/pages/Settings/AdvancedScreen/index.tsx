import { useEffect, useState } from 'react';

import { Content, Header, Layout } from '@/ui/components';
import LoadingPage from '@/ui/components/LoadingPage';
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
    return <LoadingPage />;
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
