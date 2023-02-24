import { Layout } from 'antd';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import { useState } from 'react';

import CHeader from '@/ui/components/CHeader';
import { useSetTabCallback, useTab } from '@/ui/state/global/hooks';
import { TabOption } from '@/ui/state/global/reducer';

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
  return (
    <Layout className="h-full" style={{ backgroundColor: 'blue', flex: 1 }}>
      <Header className="border-white border-opacity-10">
        <CHeader />
      </Header>
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
