import { Button, message } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KEYRING_TYPE } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { RemoveWalletPopover } from '@/ui/components/RemoveWalletPopover';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { shortAddress, useWallet } from '@/ui/utils';
import {
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';

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

  const keyrings = useKeyrings();

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
    return shortAddress(address);
    // if (keyring.addressType == AddressType.P2TR) {
    //   return address;
    // } else {
    //   return address;
    // }
  }, []);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);
  return (
    <div className={'!px-3 !py-0 box default mb-3_75 !h-24'}>
      <div className="flex items-center justify-between text-lg font-semibold h-full">
        <div className=" w-8 flex  py-6  justify-center  h-full">{selected && <CheckCircleFilled />}</div>

        <div
          className="flex py-5 ml-2 flex-col flex-grow text-left h-full cursor-pointer"
          onClick={async (e) => {
            if (currentKeyring.key !== keyring.key) {
              await wallet.changeKeyring(keyring);
              dispatch(keyringsActions.setCurrent(keyring));
              dispatch(accountActions.setCurrent(keyring.accounts[0]));
            }
            if (autoNav) navigate('MainScreen');
          }}>
          <span>{`${keyring.alianName}`} </span>
          <span className="font-normal opacity-60">{`${displayAddress}`}</span>
        </div>

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
            <SettingOutlined style={{ fontSize: 20 }} />
          </div>

          {optionsVisible && (
            <div className=" bg-hard-black right-0 shadow-md text-left p-2 z-10 mt-10 absolute  !w-64">
              <div
                className="flex px-4 py-2 items-center cursor-pointer"
                onClick={() => {
                  navigate('EditWalletNameScreen', { keyring });
                }}>
                <EditOutlined />
                <span className="ml-2">Edit Name</span>
              </div>
              {keyring.type === KEYRING_TYPE.HdKeyring ? (
                <div
                  className="flex px-4 py-2 items-center cursor-pointer"
                  onClick={() => {
                    navigate('ExportMnemonicsScreen', { keyring });
                  }}>
                  <KeyOutlined />
                  <span className="ml-2">Show Secret Recovery Phrase</span>
                </div>
              ) : (
                <div
                  className="flex px-4 py-2 items-center cursor-pointer"
                  onClick={() => {
                    navigate('ExportPrivateKeyScreen', { account: keyring.accounts[0] });
                  }}>
                  <KeyOutlined />
                  <span className="ml-2">Export WIF</span>
                </div>
              )}
              <div
                className="flex px-4 py-2 items-center cursor-pointer text-red-500"
                onClick={() => {
                  if (keyrings.length == 1) {
                    message.error('Removing the last wallet is not allowed');
                    return;
                  }
                  setRemoveVisible(true);
                  setOptionsVisible(false);
                }}>
                <DeleteOutlined />
                <span className="ml-2">Remove Wallet</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {removeVisible && (
        <RemoveWalletPopover
          keyring={keyring}
          onClose={() => {
            setRemoveVisible(false);
          }}
        />
      )}
    </div>
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
