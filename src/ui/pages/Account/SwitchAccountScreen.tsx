import { Button, message } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KEYRING_CLASS } from '@/shared/constant';
import { Account } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { copyToClipboard, shortAddress, useWallet } from '@/ui/utils';
import {
  CheckCircleFilled,
  CopyOutlined,
  EditOutlined,
  EllipsisOutlined,
  KeyOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';

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
  const [optionsVisible, setOptionsVisible] = useState(false);
  const path = keyring.hdPath + '/' + account.index;

  return (
    <div className="!px-3 !py-0 box default mb-3_75 !h-24">
      <div className="flex items-center justify-between text-lg font-semibold h-full">
        <div className=" w-8 flex  py-6  justify-center  h-full">{selected && <CheckCircleFilled />}</div>
        <div
          className="flex py-5 ml-2 flex-col flex-grow text-left h-full cursor-pointer"
          onClick={async (e) => {
            if (currentAccount.pubkey !== account.pubkey) {
              await wallet.changeAccount(account);
              dispatch(accountActions.setCurrent(account));
            }
            if (autoNav) navigate('MainScreen');
          }}>
          <span>{account?.alianName} </span>
          <span className="font-normal opacity-60">{`${shortAddress(account.address)} (${path})`}</span>
        </div>
        {account?.type == KEYRING_CLASS.PRIVATE_KEY ? (
          <span className="text-xs rounded bg-primary-active p-1.5">IMPORTED</span>
        ) : (
          <></>
        )}

        <div className="flex h-full relative">
          {optionsVisible && (
            <div
              className="z-10 fixed"
              style={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
              }}
              onTouchStart={(e) => {
                setOptionsVisible(false);
              }}
              onMouseDown={(e) => {
                setOptionsVisible(false);
              }}></div>
          )}

          <div
            className="flex py-6 px-2 cursor-pointer"
            onClick={async (e) => {
              setOptionsVisible(!optionsVisible);
            }}>
            <EllipsisOutlined style={{ fontSize: 20 }} />
          </div>

          {optionsVisible && (
            <div className=" bg-hard-black right-0 shadow-md text-left p-2 z-10 mt-10 absolute  !w-52">
              <div
                className="flex px-4 py-2 items-center cursor-pointer"
                onClick={() => {
                  navigate('EditAccountNameScreen', { account });
                }}>
                <EditOutlined />
                <span className="ml-2">Edit Name</span>
              </div>
              <div
                className="flex px-4 py-2 items-center cursor-pointer"
                onClick={() => {
                  copyToClipboard(account.address);
                  message.success('copied');
                  setOptionsVisible(false);
                }}>
                <CopyOutlined />
                <span className="ml-2">Copy address</span>
              </div>
              <div
                className="flex px-4 py-2 items-center cursor-pointer"
                onClick={() => {
                  navigate('ExportPrivateKeyScreen', { account });
                }}>
                <KeyOutlined />
                <span className="ml-2">Export WIF</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
        <div className="flex flex-col items-stech mx-5 mb-5 gap-3_75 justify-evenly">
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
