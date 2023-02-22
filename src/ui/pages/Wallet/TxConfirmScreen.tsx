import { Button } from 'antd';
import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useBitcoinTx, usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { shortAddress } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

export default function TxConfirmScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const pushBitcoinTx = usePushBitcoinTxCallback();

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        {bitcoinTx.sending ? (
          <div className="flex flex-col items-strech mx-5 text-6xl mt-60 gap-3_75 text-primary">
            <LoadingOutlined />
            <span className="text-2xl text-white self-center">{t('Sending')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
            <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Confirm payment')}</div>
            <div className="w-full text-left text-soft-white">{t('Recipient')}</div>
            <div className="justify-between w-full box nobor text-soft-white">
              <span>{shortAddress(bitcoinTx.fromAddress)}</span>
              <span className="text-white">
                <img src="./images/arrow-right.svg" alt="" />
              </span>
              <span>{shortAddress(bitcoinTx.toAddress)}</span>
            </div>
            <div className="w-full text-left text-soft-white">{t('Amount')}</div>
            <div className="justify-end w-full box nobor text-soft-white">
              <span>
                <span className="font-semibold text-white">{bitcoinTx.toAmount.toFixed(8)}</span> BTC
              </span>
            </div>
            <div className="w-full text-left text-soft-white">{t('Fee')}</div>
            <div className="justify-end w-full box nobor text-soft-white">
              <span>
                <span className="font-semibold text-white">{bitcoinTx.fee.toFixed(8)}</span> BTC
              </span>
            </div>

            <Button
              size="large"
              type="primary"
              className="box"
              onClick={(e) => {
                pushBitcoinTx().then((success) => {
                  if (success) {
                    navigate('TxSuccessScreen');
                  } else {
                    navigate('TxFailScreen');
                  }
                });
              }}>
              <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
            </Button>
          </div>
        )}
      </Content>
      <FooterBackButton
        onClick={(e) => {
          window.history.go(-1);
        }}
      />
    </Layout>
  );
}
