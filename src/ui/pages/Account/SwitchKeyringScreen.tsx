import { Button } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { WalletKeyring } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { shortAddress, useWallet } from '@/ui/utils';
import { PlusCircleOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

export interface ItemData {
  key: string;
  keyring?: WalletKeyring;
}

interface MyItemProps {
  keyring?: WalletKeyring;
  autoNav?: boolean;
}

export function MyItem({ keyring, autoNav }: MyItemProps, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentKeyring = useCurrentKeyring();
  const selected = currentKeyring.index === keyring?.index;
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  if (!keyring) {
    return (
      <Button
        size="large"
        type="primary"
        className="box mb-5"
        onClick={(e) => {
          // todo
          navigate('AddKeyringScreen');
        }}>
        <div className="flex items-center justify-center text-lg font-semibold">{t('Add New Wallet')}</div>
      </Button>
    );
  }

  const displayAddress = useMemo(() => {
    const address = keyring.accounts[0].address;
    return shortAddress(address, 15);
    // if (keyring.addressType == AddressType.P2TR) {
    //   return address;
    // } else {
    //   return address;
    // }
  }, []);
  return (
    <Button
      size="large"
      type="default"
      className={'p-5 box default mb-3_75 btn-88'}
      onClick={async (e) => {
        if (currentKeyring.key !== keyring.key) {
          await wallet.changeKeyring(keyring);
          dispatch(keyringsActions.setCurrent(keyring));
          dispatch(accountActions.setCurrent(keyring.accounts[0]));
        }
        if (autoNav) navigate('MainScreen');
      }}>
      <div className="flex items-center justify-between text-lg font-semibold">
        <div className="flex flex-col flex-grow text-left">
          <span>{`${keyring.alianName}`} </span>
          <span className="font-normal opacity-60">{`${displayAddress}`}</span>
        </div>
        <div className="flex text-rgiht items-end justify-end mr-2">
          {selected && (
            <span className="w-4 ml-2_5">
              <img src="./images/check.svg" alt="" />
            </span>
          )}
        </div>
      </div>
    </Button>
  );
}

export default function SwitchKeyringScreen() {
  const navigate = useNavigate();

  const keyrings = useKeyrings();

  const items = useMemo(() => {
    const _items: ItemData[] = keyrings.map((v) => {
      return {
        key: v.key,
        keyring: v
      };
    });
    // _items.push({
    //   key: 'add'
    // });
    return _items;
  }, [keyrings]);
  const ForwardMyItem = forwardRef(MyItem);
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Wallet"
        RightComponent={
          <div
            className="duration-80  cursor-pointer"
            onClick={() => {
              navigate('AddKeyringScreen');
            }}>
            <div className="flex items-end justify-end">
              <PlusCircleOutlined style={{ fontSize: '24px' }} />
            </div>
          </div>
        }
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-stech mx-5 gap-3_75 justify-evenly">
          <VirtualList
            data={items}
            data-id="list"
            itemHeight={30}
            itemKey={(item) => item.key}
            // disabled={animating}
            style={{
              boxSizing: 'border-box'
            }}
            // onSkipRender={onAppear}
            // onItemRemove={onAppear}
          >
            {(item, index) => <ForwardMyItem keyring={item.keyring} autoNav={true} />}
          </VirtualList>
        </div>
      </Content>
    </Layout>
  );
}
