import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import { TxType } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useOrdinalsTx, usePushOrdinalsTxCallback } from '@/ui/state/transactions/hooks';
import { LoadingOutlined } from '@ant-design/icons';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

export default function OrdinalsTxConfirmScreen() {
  const { t } = useTranslation();
  const ordinalsTx = useOrdinalsTx();
  const navigate = useNavigate();
  const pushOrdinalsTx = usePushOrdinalsTxCallback();
  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }} className="overflow-auto">
        {ordinalsTx.sending ? (
          <div className="flex flex-col items-strech mx-5 text-6xl mt-60 gap-3_75 text-primary">
            <LoadingOutlined />
            <span className="text-2xl text-white text-center">{t('Sending')}</span>
          </div>
        ) : (
          <SignPsbt
            params={{ data: { psbtHex: ordinalsTx.psbtHex, type: TxType.SEND_INSCRIPTION } }}
            handleCancel={() => {
              navigate('MainScreen');
            }}
            handleConfirm={() => {
              pushOrdinalsTx().then((success) => {
                if (success) {
                  navigate('TxSuccessScreen');
                } else {
                  navigate('TxFailScreen');
                }
              });
            }}
          />
        )}
      </Content>
    </Layout>
  );
}
