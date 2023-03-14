import { Button, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { KEYRING_TYPE } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { RightOutlined } from '@ant-design/icons';

interface Item {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: string;
  route: string;
  right: boolean;
  keyringType?: string;
  enable: boolean;
}

type MyItemProps = {
  key: number;
  item: Item;
};

const MyItem: React.FC<MyItemProps> = forwardRef(({ item, key }, ref) => {
  const navigate = useNavigate();
  return (
    <Button
      ref={ref as any}
      key={key}
      danger={item.danger}
      type={item.danger ? 'text' : 'default'}
      size="large"
      className={`mb-3_75 box mx-5 ${item.danger ? item.danger : 'default'} ${item.right ? 'btn-settings' : ''}`}
      onClick={(e) => {
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

export default function ManageWalletScreen() {
  const currentKeyring = useCurrentKeyring();
  const items: Item[] = [
    {
      label: '',
      value: '',
      desc: 'Edit Wallet Name',
      action: 'edit-wallet-name',
      route: '/settings/edit-wallet-name',
      right: false,
      enable: true
    },
    {
      label: '',
      value: '',
      desc: 'Show Secret Recovery Phrase',
      action: 'export-mnemonics',
      route: '/settings/export-mnemonics',
      right: false,
      enable: currentKeyring.type === KEYRING_TYPE.HdKeyring
    },
    {
      label: '',
      value: '',
      desc:
        currentKeyring.type === KEYRING_TYPE.HdKeyring ? 'Export Private Key (Current Account)' : 'Export Private Key',
      action: 'export-privatekey',
      route: '/settings/export-privatekey',
      right: false,
      enable: true
    },
    {
      label: '',
      value: '',
      danger: true,
      desc: 'Remove Wallet',
      action: 'remove-wallet',
      route: '/settings/remove-wallet',
      right: false,
      enable: true
    }
  ];

  const toRenderItems = items.filter((v) => v.enable == true);

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Manage Wallet"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="mt-3_75">
          <VirtualList
            data={toRenderItems}
            data-id="list"
            // height={virtualListHeight}
            itemHeight={20}
            itemKey={(item) => item.action}
            style={{
              boxSizing: 'border-box'
            }}>
            {(item, index) => <MyItem key={index} item={item} />}
          </VirtualList>
        </div>
      </Content>
    </Layout>
  );
}
