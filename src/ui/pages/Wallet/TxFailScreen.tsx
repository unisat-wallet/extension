import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';

export default function TxFailScreen() {
  const { t } = useTranslation();
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-center mx-auto mt-36 gap-2_5 w-110">
          <img src="./images/Delete.svg" alt="" />
          <span className="mt-6 text-2xl">{t('Payment Failed')}</span>
          <span className="text-error">{t('Your transaction has not succesfully sent')}</span>
        </div>
      </Content>
    </Layout>
  );
}
