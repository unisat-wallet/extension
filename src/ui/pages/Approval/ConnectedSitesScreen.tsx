import { Button, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';

import { ConnectedSite } from '@/background/service/permission';
import CHeader from '@/ui/components/CHeader';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

export default function ConnectedSitesScreen() {
  const wallet = useWallet();

  const [sites, setSites] = useState<ConnectedSite[]>([]);

  const getSites = async () => {
    const sites = await wallet.getConnectedSites();
    setSites(sites);
  };

  useEffect(() => {
    getSites();
  }, []);

  const handleRemove = async (origin: string) => {
    await wallet.removeConnectedSite(origin);
    getSites();
  };
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Connected Sites"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech gap-3_75 justify-evenly mx-5 mt-5">
          {sites.length > 0 ? (
            sites.map((item, index) => {
              return (
                <Button key={item.origin} size="large" type="default" className="p-5 box default btn-88">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <div className="flex flex-grow text-left">
                      <img src={item.icon} className="w-8 mr-3" />
                      <div className="font-normal opacity-60">{item.origin}</div>
                    </div>

                    <span
                      onClick={() => {
                        handleRemove(item.origin);
                      }}>
                      <CloseOutlined />
                    </span>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="self-center">NO DATA</div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
