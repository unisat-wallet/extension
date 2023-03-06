import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import { TxType } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useBitcoinTx, usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { LoadingOutlined } from '@ant-design/icons';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

export default function TxConfirmScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const pushBitcoinTx = usePushBitcoinTxCallback();
  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        {bitcoinTx.sending ? (
          <div className="flex flex-col items-strech mx-5 text-6xl mt-60 gap-3_75 text-primary">
            <LoadingOutlined />
            <span className="text-2xl text-white self-center">{t('Sending')}</span>
          </div>
        ) : (
          <SignPsbt
            params={{ data: { psbtHex: bitcoinTx.psbtHex, type: TxType.SEND_BITCOIN } }}
            handleCancel={() => {
              navigate('MainScreen');
            }}
            handleConfirm={() => {
              pushBitcoinTx().then((success) => {
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
