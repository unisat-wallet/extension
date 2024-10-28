import VirtualList, { ListRef } from 'rc-virtual-list';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { RemoveWalletPopover } from '@/ui/components/RemoveWalletPopover';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { colors } from '@/ui/theme/colors';
import { shortAddress, useWallet } from '@/ui/utils';
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

export interface ItemData {
  key: string;
  keyring?: WalletKeyring;
}

interface MyItemProps {
  keyring?: WalletKeyring;
  autoNav?: boolean;
}

const ITEM_HEIGHT = 64;

export function MyItem({ keyring, autoNav }: MyItemProps, ref) {
  const navigate = useNavigate();
  const currentKeyring = useCurrentKeyring();
  const selected = currentKeyring.index === keyring?.index;
  const wallet = useWallet();

  const keyrings = useKeyrings();

  const dispatch = useAppDispatch();

  const tools = useTools();

  if (!keyring) {
    return <div style={{ height: ITEM_HEIGHT }} />;
  }

  const displayAddress = useMemo(() => {
    if (!keyring.accounts[0]) {
      return 'Invalid';
    }
    const address = keyring.accounts[0].address;
    return shortAddress(address);
  }, []);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

  return (
    <Card
      justifyBetween
      style={{
        height: ITEM_HEIGHT - 8,
        marginTop: 8,
        borderColor: 'rgba(244,182,44,0.5)',
        borderWidth: selected ? 1 : 0,
        backgroundColor: selected ? 'rgba(244,182,44,0.1)' : colors.black_dark,
        marginLeft: 10,
        marginRight: 10
      }}>
      <Row
        full
        onClick={async (e) => {
          if (!keyring.accounts[0]) {
            tools.toastError('Invalid wallet, please remove it and add new one');
            return;
          }
          if (currentKeyring.key !== keyring.key) {
            await wallet.changeKeyring(keyring);
            dispatch(keyringsActions.setCurrent(keyring));
            const _currentAccount = await wallet.getCurrentAccount();
            dispatch(accountActions.setCurrent(_currentAccount));
          }
          if (autoNav) navigate('MainScreen');
        }}>
        <Column style={{ width: 20 }} selfItemsCenter>
          {selected ? <Icon icon="circle-check" color="gold" /> : <Icon icon="circle-check" color="white_muted2" />}
        </Column>

        <Column justifyCenter>
          <Text text={`${keyring.alianName}`} />
          <Text text={`${displayAddress}`} preset="sub" />
        </Column>
      </Row>

      <Column relative>
        {optionsVisible && (
          <div
            style={{
              position: 'fixed',
              zIndex: 10,
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

        <Icon
          onClick={async (e) => {
            setOptionsVisible(!optionsVisible);
          }}>
          <SettingOutlined />
        </Icon>

        {optionsVisible && (
          <Column
            style={{
              backgroundColor: colors.black,
              width: 180,
              position: 'absolute',
              right: 0,
              padding: 5,
              zIndex: 10
            }}>
            <Column>
              <Row
                onClick={() => {
                  navigate('EditWalletNameScreen', { keyring });
                }}>
                <EditOutlined />
                <Text text="Edit Name" size="sm" />
              </Row>

              {keyring.type === KEYRING_TYPE.HdKeyring && (
                <Row
                  onClick={() => {
                    navigate('ExportMnemonicsScreen', { keyring });
                  }}>
                  <KeyOutlined />
                  <Text text="Show Secret Recovery Phrase" size="sm" />
                </Row>
              )}
              {keyring.type !== KEYRING_TYPE.HdKeyring && keyring.type !== KEYRING_TYPE.KeystoneKeyring && (
                <Row
                  onClick={() => {
                    navigate('ExportPrivateKeyScreen', { account: keyring.accounts[0] });
                  }}>
                  <KeyOutlined />
                  <Text text="Export Private Key" size="sm" />
                </Row>
              )}
              <Row
                onClick={() => {
                  if (keyrings.length == 1) {
                    tools.toastError('Removing the last wallet is not allowed');
                    return;
                  }
                  setRemoveVisible(true);
                  setOptionsVisible(false);
                }}>
                <Icon color="danger">
                  <DeleteOutlined />
                </Icon>

                <Text text="Remove Wallet" size="sm" color="danger" />
              </Row>
            </Column>
          </Column>
        )}
      </Column>

      {removeVisible && (
        <RemoveWalletPopover
          keyring={keyring}
          onClose={() => {
            setRemoveVisible(false);
          }}
        />
      )}
    </Card>
  );
}

export default function SwitchKeyringScreen() {
  const navigate = useNavigate();

  const keyrings = useKeyrings();

  const ForwardMyItem = forwardRef(MyItem);
  const refList = useRef<ListRef>(null);

  const items = useMemo(() => {
    const _items: ItemData[] = keyrings.map((v) => {
      return {
        key: v.key,
        keyring: v
      };
    });

    for (let i = 0; i < 2; i++) {
      _items.push({
        key: 'dummy_' + i,
        keyring: undefined
      });
    }
    return _items;
  }, [keyrings]);

  const currentKeyring = useCurrentKeyring();
  const currentIndex = keyrings.findIndex((v) => v.key == currentKeyring.key);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (refList.current && currentIndex >= 0) {
        refList.current?.scrollTo({ index: currentIndex, align: 'top' });
      }
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const layoutHeight = Math.ceil((window.innerHeight - 64) / ITEM_HEIGHT) * ITEM_HEIGHT;

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Wallet"
        RightComponent={
          <Icon
            onClick={() => {
              navigate('AddKeyringScreen');
            }}>
            <PlusCircleOutlined />
          </Icon>
        }
      />
      <Content style={{ padding: 5 }}>
        <VirtualList
          ref={refList}
          data={items}
          data-id="list"
          height={layoutHeight}
          itemHeight={ITEM_HEIGHT}
          itemKey={(item) => item.key}
          style={{
            boxSizing: 'border-box'
          }}>
          {(item, index) => <ForwardMyItem keyring={item.keyring} autoNav={true} />}
        </VirtualList>
      </Content>
    </Layout>
  );
}
