import { Layout } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';

import CHeader from '@/ui/components/CHeader';
import { getCurrentTab } from '@/ui/features/browser/tabs';
import { useSetTabCallback, useTab } from '@/ui/state/global/hooks';
import { TabOption } from '@/ui/state/global/reducer';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../../MainRoute';
import AppTab from './AppTab';
import MintTab from './MintTab';
import SettingsTab from './SettingsTab';
import WalletTab from './WalletTab';

function TabButton({ tabName, icon }: { tabName: TabOption; icon: string }) {
  const tab = useTab();
  const setTab = useSetTabCallback();
  const [hover, setHover] = useState('');
  return (
    <div
      className={`cursor-pointer flex items-center justify-center h-full text-center ${
        tab == tabName ? 'text-primary' : ''
      }`}
      onClick={(e) => {
        setTab(tabName);
      }}
      onMouseOver={(e) => {
        setHover(tabName);
      }}
      onMouseLeave={(e) => {
        setHover('');
      }}>
      <img
        src={`./images/${icon}-solid${tab == tabName ? '-active' : hover == tabName ? '-active' : ''}.svg`}
        alt=""
        className="h-6 drop-shadow-footer"
      />
    </div>
  );
}

export default function MainScreen() {
  const tab = useTab();
  const wallet = useWallet();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const currentKeyring = useCurrentKeyring();
  useEffect(() => {
    const run = async () => {
      const res = await getCurrentTab();
      if (!res) return;
      const site = await wallet.getCurrentConnectedSite(res.id);
      if (site) {
        setConnected(site.isConnected);
      }
    };
    run();
  }, []);

  return (
    <Layout className="h-full" style={{ backgroundColor: 'blue', flex: 1 }}>
      <CHeader
        LeftComponent={
          <div
            className="duration-80  cursor-pointer"
            onClick={() => {
              navigate('ConnectedSitesScreen');
            }}>
            {connected ? (
              <div className="flex items-center">
                <div className="text-green-300 font-semibold mr-3 text-11">·</div>
                <span className="pt-1 text-sm">Dapp Connected</span>
              </div>
            ) : (
              <div className="flex items-center ">
                <span className="pt-2 text-sm">{''}</span>
              </div>
            )}
          </div>
        }
        RightComponent={
          <div
            className="duration-80  cursor-pointer"
            onClick={() => {
              navigate('SwitchKeyringScreen');
            }}>
            <div className="flex items-end justify-end ">
              <div className="text-xs rounded bg-primary-active p-1 px-3">{`${currentKeyring.alianName}`}</div>
            </div>
          </div>
        }
      />
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
        {tab == 'home' ? (
          <WalletTab />
        ) : tab == 'mint' ? (
          <MintTab />
        ) : tab == 'app' ? (
          <AppTab />
        ) : tab == 'settings' ? (
          <SettingsTab />
        ) : (
          <WalletTab />
        )}
      </Content>
      <Footer style={{ height: '5.625rem', bottom: 0 }}>
        <div className="grid w-full h-full grid-cols-4 text-2xl border-white bg-soft-black border-opacity-10">
          <TabButton tabName="home" icon="wallet" />
          <TabButton tabName="mint" icon="compass" />
          <TabButton tabName="app" icon="grid" />

          <TabButton tabName="settings" icon="gear" />
        </div>
      </Footer>
    </Layout>
  );
}
