import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useBitcoinTx } from '@/ui/state/transactions/hooks';
import { shortAddress } from '@/ui/utils';

export default () => {
  const { t } = useTranslation();
  const bitcoinTx = useBitcoinTx();
  const navigate = useNavigate();
  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-36 gap-2_5">
          <span className="w-24 h-24 self-center">
            <img src="./images/Success.svg" alt="" />
          </span>
          <span className="mt-6 text-2xl self-center">{t('Payment Sent')}</span>
          <span className="text-soft-white self-center">{t('Your transaction has been succesfully sent')}</span>
          {bitcoinTx.toAmount > 0 && (
            <div className="justify-between w-full box nobor text-soft-white mt-2_5">
              <span>{shortAddress(bitcoinTx.fromAddress)}</span>
              <div className="flex">
                <span className="font-semibold text-warn">-&nbsp;</span>
                <span className="font-semibold text-white">{bitcoinTx.toAmount}</span>&nbsp;BTC
              </div>
            </div>
          )}
          {bitcoinTx.toAmount > 0 && (
            <div className="flex self-center text-white duration-80 opacity-60 hover:opacity-100 mt-5">
              <img src="./images/eye.svg" alt="" />
              <a
                className="font-semibold text-white cursor-pointer hover:text-white"
                href={`https://blockstream.info/tx/${bitcoinTx.txid}`}
                target="_blank"
                rel="noreferrer">
                &nbsp;{t('View on Block Explorer')}
              </a>
            </div>
          )}
        </div>
      </Content>
      <FooterBackButton
        onClick={(e) => {
          navigate('MainScreen');
        }}
      />
    </Layout>
  );
};
