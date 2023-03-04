import { Button, Layout } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccounts } from '@/ui/state/accounts/hooks';
import { useChangeNetworkTypeCallback, useNetworkType } from '@/ui/state/settings/hooks';
import { useApproval, useWallet } from '@/ui/utils';

import { MyItem } from '../../Account/SwitchAccountScreen';

interface Props {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function Connect({ params: { session } }: Props) {
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

  const accounts = useAccounts();
  const items = accounts.map((v) => ({
    key: v.address,
    account: v
  }));
  const ForwardMyItem = forwardRef(MyItem);

  return (
    <Layout className="h-full">
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <WebsiteBar session={session} />
          <div className="flex self-center px-2 text-2xl font-semibold">Connect with Unist Wallet</div>
          <div className="flex self-center px-2 text-center">Select the account to use on this site</div>
          <div className="flex flex-col px-10  text-soft-white   text-center mt-5">
            Only connect with sites you trust.
          </div>

          <div className="flex flex-col items-stech mx-5 my-5 gap-3_75 justify-evenly">
            <VirtualList
              data={items}
              data-id="list"
              itemHeight={20}
              itemKey={(item) => item.key}
              // disabled={animating}
              style={{
                boxSizing: 'border-box'
              }}
              // onSkipRender={onAppear}
              // onItemRemove={onAppear}
            >
              {(item, index) => <ForwardMyItem account={item.account} />}
            </VirtualList>
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
