import { Button } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { KEYRING_CLASS } from '@/shared/constant';
import { Account } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { shortAddress, useWallet } from '@/ui/utils';
import { PlusCircleOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

export interface ItemData {
  key: string;
  account?: Account;
}

interface MyItemProps {
  account?: Account;
  autoNav?: boolean;
}

export function MyItem({ account, autoNav }: MyItemProps, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const selected = currentAccount.pubkey == account?.pubkey;
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const keyring = useCurrentKeyring();
  if (!account) {
    return (
      <Button
        size="large"
        type="primary"
        className="box"
        onClick={(e) => {
          // todo
          navigate('CreateAccountScreen');
        }}>
        <div className="flex items-center justify-center text-lg font-semibold">{t('Add New Account')}</div>
      </Button>
    );
  }

  const path = keyring.hdPath + '/' + account.index;

  return (
    <Button
      size="large"
      type="default"
      className="p-5 box default mb-3_75 !h-24"
      onClick={async (e) => {
        if (currentAccount.pubkey !== account.pubkey) {
          await wallet.changeAccount(account);
          dispatch(accountActions.setCurrent(account));
        }
        if (autoNav) navigate('MainScreen');
      }}>
      <div className="flex items-center justify-between text-lg font-semibold">
        <div className="flex flex-col flex-grow text-left">
          <span>{account?.alianName} </span>
          <span className="font-normal opacity-60">{`${shortAddress(account.address)}`}</span>
          <span className="font-normal opacity-60">{path}</span>
        </div>
        {account?.type == KEYRING_CLASS.PRIVATE_KEY ? (
          <span className="text-xs rounded bg-primary-active p-1.5">IMPORTED</span>
        ) : (
          <></>
        )}
        {selected ? (
          <span className="w-4 ml-2_5">
            <img src="./images/check.svg" alt="" />
          </span>
        ) : (
          <span className="w-4 ml-2_5"></span>
        )}
      </div>
    </Button>
  );
}

export default function SwitchAccountScreen() {
  const navigate = useNavigate();
  const keyring = useCurrentKeyring();
  const items = useMemo(() => {
    const _items: ItemData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
  }, []);
  const ForwardMyItem = forwardRef(MyItem);

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Account"
        RightComponent={
          <div
            className="duration-80  cursor-pointer"
            onClick={() => {
              navigate('CreateAccountScreen');
            }}>
            <div className="flex items-end justify-end">
              <PlusCircleOutlined style={{ fontSize: '24px' }} />
            </div>
          </div>
        }
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
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
            {(item, index) => <ForwardMyItem account={item.account} autoNav={true} />}
          </VirtualList>
        </div>
      </Content>
    </Layout>
  );
}
