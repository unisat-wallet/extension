import { useLocation } from 'react-router-dom';

import { CAT20TokenInfo } from '@/shared/types';
import { Content, Header, Layout } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

export default function MergeCAT20HistoryScreen() {
  const { state } = useLocation();
  const props = state as {
    cat20Info: CAT20TokenInfo;
  };
  const { t } = useI18n();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('merge_history')}
      />
      <Content></Content>
    </Layout>
  );
}
