import { Button } from 'antd';
import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';

import { useNavigate } from '../MainRoute';

export default function AddAccountScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Add a new account')}</div>
          <Button
            size="large"
            type="default"
            className="mt-1_25 box default btn-settings"
            onClick={(e) => {
              navigate('CreateAccountScreen');
            }}>
            <div className="flex items-center justify-between font-semibold text-4_5">
              <div className="flex flex-col text-left gap-2_5">
                <span>{t('Create a new account')}</span>
                <span className="font-normal opacity-60">{t('Generate a new address')}</span>
              </div>
              <div className="flex-grow"> </div>
              {/* <RightOutlined style={{transform: 'scale(1.2)', opacity: '80%'}}/> */}
            </div>
          </Button>

          <Button
            size="large"
            type="default"
            className="box default btn-settings"
            onClick={(e) => {
              navigate('ImportAccountScreen');
            }}>
            <div className="flex items-center justify-between font-semibold text-4_5">
              <div className="flex flex-col text-left gap-2_5">
                <span>{t('Import Private Key')}</span>
                <span className="font-normal opacity-60">{t('Import an existing account')}</span>
              </div>
              <div className="flex-grow"> </div>
              {/* <RightOutlined style={{transform: 'scale(1.2)', opacity: '80%'}}/> */}
            </div>
          </Button>
        </div>
      </Content>
      <FooterBackButton />
    </Layout>
  );
}
