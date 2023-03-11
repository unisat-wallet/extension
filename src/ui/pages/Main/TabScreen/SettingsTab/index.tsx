import { Button } from 'antd';
import { t } from 'i18next';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { NETWORK_TYPES } from '@/shared/constant';
import { useExtensionIsInTab, useOpenExtensionInTab } from '@/ui/features/browser/tabs';
import { getCurrentTab } from '@/ui/features/browser/tabs';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';
import { RightOutlined } from '@ant-design/icons';

interface Setting {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: string;
  route: string;
  right: boolean;
}

const SettingList: Setting[] = [
  {
    label: 'Manage Wallet',
    value: '',
    desc: '',
    action: 'manage-wallet',
    route: '/settings/manage-wallet',
    right: true
  },
  {
    label: 'Connected Sites',
    value: '',
    desc: '',
    action: 'connected-sites',
    route: '/connected-sites',
    right: true
  },

  {
    label: t('Network'),
    value: t('MAINNET'),
    desc: '',
    action: 'networkType',
    route: '/settings/network-type',
    right: true
  },

  {
    label: t('Change Password'),
    value: t('Change your lockscreen password'),
    desc: '',
    action: 'password',
    route: '/settings/password',
    right: true
  },

  {
    label: '',
    value: '',
    desc: t('Expand View'),
    action: 'expand-view',
    route: '/settings/export-privatekey',
    right: false
  }
];

type MyItemProps = {
  key: number;
  item: Setting;
  navigate: NavigateFunction;
};

const MyItem: React.FC<MyItemProps> = forwardRef(({ item, key, navigate }, ref) => {
  const openExtensionInTab = useOpenExtensionInTab();
  return (
    <Button
      ref={ref as any}
      key={key}
      danger={item.danger}
      type={item.danger ? 'text' : 'default'}
      size="large"
      className={`mb-3_75 box mx-5 ${item.danger ? item.danger : 'default'} ${item.right ? 'btn-settings' : ''}`}
      onClick={(e) => {
        if (item.action == 'expand-view') {
          openExtensionInTab();
          return;
        }
        navigate(item.route);
      }}>
      <div className="flex items-center justify-between font-semibold text-4_5">
        <div className="flex flex-col text-left gap-2_5">
          <span>{item.label}</span>
          <span className="font-normal opacity-60">{item.value}</span>
        </div>
        <div className="flex-grow">{item.desc}</div>
        {item.right ? <RightOutlined style={{ transform: 'scale(1.2)', color: '#AAA' }} /> : <></>}
      </div>
    </Button>
  );
});

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export type ScrollConfig =
  | {
      index: number;
      align?: ScrollAlign;
      offset?: number;
    }
  | {
      key: React.Key;
      align?: ScrollAlign;
      offset?: number;
    };

export type ScrollTo = (arg: number | ScrollConfig) => void;

type ListRef = {
  scrollTo: ScrollTo;
};

export default function SettingsTab() {
  const navigate = useNavigate();

  const networkType = useNetworkType();

  const isInTab = useExtensionIsInTab();

  const [connected, setConnected] = useState(false);

  const currentKeyring = useCurrentKeyring();

  const wallet = useWallet();
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

  const toRenderSettings = SettingList.filter((v) => {
    if (v.action == 'manage-wallet') {
      v.value = currentKeyring.alianName;
    }

    if (v.action == 'connected-sites') {
      v.value = connected ? 'Connected' : 'Not connected';
    }

    if (v.action == 'networkType') {
      v.value = NETWORK_TYPES[networkType].label;
    }

    if (v.action == 'expand-view') {
      if (isInTab) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col items-strech h-full">
      <div className="mt-3_75">
        <VirtualList
          data={toRenderSettings}
          data-id="list"
          // height={virtualListHeight}
          itemHeight={20}
          itemKey={(item) => item.action}
          style={{
            boxSizing: 'border-box'
          }}>
          {(item, index) => <MyItem key={index} navigate={navigate} item={item} />}
        </VirtualList>
      </div>
    </div>
  );
}
