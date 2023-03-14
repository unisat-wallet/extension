import { Button, Layout } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';

import { NETWORK_TYPES } from '@/shared/constant';
import { NetworkType } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useApproval } from '@/ui/utils';

interface Props {
  params: {
    data: {
      networkType: NetworkType;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function SwitchNetwork({ params: { data, session } }: Props) {
  const networkType = useNetworkType();
  const from = NETWORK_TYPES[networkType];
  const to = NETWORK_TYPES[data.networkType];

  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleConnect = async () => {
    resolveApproval();
  };

  return (
    <Layout className="h-full">
      <CHeader />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <div className="flex justify-center mt-5">
            <div className="flex items-center px-5 py-2 bg-soft-black  rounded-lg">
              <img src={session.icon} className="w-10 h-10" />
              <div className="text-15 font-medium ">{session.origin}</div>
            </div>
          </div>

          <div className="flex flex-col px-2 text-2xl font-semibold h-13 text-center mt-5">
            Allow this site to switch the network?
          </div>

          <div className="flex justify-center items-center mt-5">
            <div className="text-2xl px-5 py-2 bg-soft-black rounded-lg">{from.label}</div>
            <div className="text-2xl px-10">{'>'}</div>
            <div className="text-2xl px-5 py-2 bg-soft-black rounded-lg">{to.label}</div>
          </div>
        </div>
      </Content>

      <Footer className="footer-bar flex-col">
        <div className="grid grid-cols-2 gap-x-2.5 mx-5">
          <Button size="large" type="default" className="box" onClick={handleCancel}>
            <div className="flex flex-col items-center text-lg font-semibold">Cancel</div>
          </Button>
          <Button size="large" type="primary" className="box" onClick={handleConnect}>
            <div className="flex  flex-col items-center text-lg font-semibold">Switch Network</div>
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}
