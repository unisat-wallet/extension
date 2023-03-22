import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterButton } from '@/ui/components/FooterBackButton';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useOrdinalsTx } from '@/ui/state/transactions/hooks';

export default () => {
  const { t } = useTranslation();
  const bitcoinTx = useBitcoinTx();
  const navigate = useNavigate();
  const blockstreamUrl = useBlockstreamUrl();

  const ordinalsTx = useOrdinalsTx();
  const txid = ordinalsTx.txid || bitcoinTx.txid;
  return (
    <Layout className="h-full">
      <CHeader />

      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-36 gap-2_5">
          <span className="w-24 h-24 self-center">
            <img src="./images/Success.svg" alt="" />
          </span>
          <span className="mt-6 text-2xl self-center">{t('Payment Sent')}</span>
          <span className="text-soft-white self-center">{t('Your transaction has been succesfully sent')}</span>

          <div className="flex self-center text-white duration-80 opacity-60 hover:opacity-100 mt-5">
            <img src="./images/eye.svg" alt="" />
            <a
              className="font-semibold text-white cursor-pointer hover:text-white"
              href={`${blockstreamUrl}/tx/${txid}`}
              target="_blank"
              rel="noreferrer">
              &nbsp;{t('View on Block Explorer')}
            </a>
          </div>
        </div>
      </Content>
      <FooterButton
        title="Done"
        onClick={() => {
          navigate('MainScreen');
        }}
      />
    </Layout>
  );
};
