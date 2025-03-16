import { useLocation } from 'react-router-dom';

import { CAT20TokenInfo } from '@/shared/types';
import { Content, Header, Layout } from '@/ui/components';

export default function MergeCAT20HistoryScreen() {
  const { state } = useLocation();
  const props = state as {
    cat20Info: CAT20TokenInfo;
  };

  // useEffect(() => {}, []);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Merge History"
      />
      <Content></Content>
    </Layout>
  );
}
