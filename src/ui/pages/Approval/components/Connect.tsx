import { Button, Layout } from 'antd';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CHeader from '@/ui/components/CHeader';
import { useChangeNetworkTypeCallback, useNetworkType } from '@/ui/state/settings/hooks';
import { useApproval, useWallet } from '@/ui/utils';

interface ConnectProps {
  params: any;
}
export default function Connect({ params: { icon, origin } }: ConnectProps) {
  const { t } = useTranslation();
  const networkType = useNetworkType();
  const changeNetworkType = useChangeNetworkTypeCallback();

  const wallet = useWallet();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const [approval, setApproval] = useState<any>(null);

  const navigate = useNavigate();

  const init = async () => {
    // todo
  };

  useEffect(() => {
    init();
  }, []);

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleConnect = async () => {
    resolveApproval();
  };

  return (
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <div className="flex flex-col px-2 text-2xl font-semibold h-13 text-center">Connect Wallet</div>
          <div className="site-info__text">
            <p className="text-15 font-medium">{origin}</p>
          </div>
        </div>
      </Content>

      <Footer className="footer-bar flex-col">
        <div className="grid grid-cols-2 gap-x-2.5 mx-5">
          <Button size="large" type="default" className="box" onClick={handleCancel}>
            <div className="flex flex-col items-center text-lg font-semibold">Cancel</div>
          </Button>
          <Button size="large" type="primary" className="box" onClick={handleConnect}>
            <div className="flex  flex-col items-center text-lg font-semibold">Connect</div>
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}
