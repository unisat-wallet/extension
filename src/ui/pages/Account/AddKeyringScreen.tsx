import { Button } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';

import { useNavigate } from '../MainRoute';

export default function AddKeyringScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Create a new wallet"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <Button
            size="large"
            type="default"
            className="mt-1_25 box default btn-settings"
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: false });
            }}>
            <div className="flex items-center justify-between font-semibold text-4_5">
              <div className="flex flex-col text-left gap-2_5">
                <span>{t('Create Wallet ')}</span>
                <span className="font-normal opacity-60">{t('Create a new wallet with mnemonics (12-words)')}</span>
              </div>
              <div className="flex-grow"> </div>
              {/* <RightOutlined style={{transform: 'scale(1.2)', opacity: '80%'}}/> */}
            </div>
          </Button>

          <Button
            size="large"
            type="default"
            className="mt-1_25 box default btn-settings"
            onClick={(e) => {
              navigate('CreateHDWalletScreen', { isImport: true });
            }}>
            <div className="flex items-center justify-between font-semibold text-4_5">
              <div className="flex flex-col text-left gap-2_5">
                <span>{t('Restore Wallet')}</span>
                <span className="font-normal opacity-60">{t('Restore from mnemonics (12-words)')}</span>
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
              navigate('CreateSimpleWalletScreen');
            }}>
            <div className="flex items-center justify-between font-semibold text-4_5">
              <div className="flex flex-col text-left gap-2_5">
                <span>{t('Restore from single private key')}</span>
              </div>
              <div className="flex-grow"> </div>
              {/* <RightOutlined style={{transform: 'scale(1.2)', opacity: '80%'}}/> */}
            </div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
