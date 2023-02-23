import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { useNavigate } from '@/ui/pages/MainRoute';

export default function TxFailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            navigate('TxConfirmScreen');
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-center mx-auto mt-36 gap-2_5 w-110">
          <img src="./images/Delete.svg" alt="" />
          <span className="mt-6 text-2xl">{t('Payment Faild')}</span>
          <span className="text-error">{t('Your transaction had not succesfully sent')}</span>
        </div>
      </Content>
    </Layout>
  );
}
