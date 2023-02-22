import { Button } from 'antd';
import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Account } from '@/background/service/preference';
import { publicKeyToAddress } from '@/background/utils/tx-utils';
import { KEYRING_CLASS, NET_WORK } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useAccounts, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useAddressType } from '@/ui/state/settings/hooks';
import { shortAddress, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface ItemData {
  key: string;
  account?: Account;
}

interface MyItemProps {
  account?: Account;
}

function MyItem({ account }: MyItemProps, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const selected = currentAccount.address == account?.address;
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const addressType = useAddressType();
  if (!account) {
    return (
      <Button
        size="large"
        type="primary"
        className="box"
        onClick={(e) => {
          // todo
          navigate('AddAccountScreen');
        }}>
        <div className="flex items-center justify-center text-lg font-semibold">{t('Add New Account')}</div>
      </Button>
    );
  }
  return (
    <Button
      size="large"
      type="default"
      className="p-5 box default mb-3_75 btn-88"
      onClick={async (e) => {
        if (currentAccount.address !== account.address) {
          await wallet.changeAccount(account);
          dispatch(accountActions.setCurrent(account));
        }
        navigate('MainScreen');
      }}>
      <div className="flex items-center justify-between text-lg font-semibold">
        <div className="flex flex-col flex-grow text-left">
          <span>{account?.alianName} </span>
          <span className="font-normal opacity-60">
            ({shortAddress(publicKeyToAddress(account?.address, addressType, NET_WORK))})
          </span>
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
  const { t } = useTranslation();
  const html = document.getElementsByTagName('html')[0];
  let virtualListHeight = 500;
  if (html && getComputedStyle(html).fontSize) {
    virtualListHeight = (virtualListHeight * parseFloat(getComputedStyle(html).fontSize)) / 16;
  }

  const accounts = useAccounts();
  const items = useMemo(() => {
    const _items: ItemData[] = accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    _items.push({
      key: 'add'
    });
    return _items;
  }, []);

  const ForwardMyItem = forwardRef(MyItem);

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-stech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Switch Account')}</div>
          <VirtualList
            data={items}
            data-id="list"
            height={virtualListHeight}
            itemHeight={20}
            itemKey={(item) => item.key}
            // disabled={animating}
            style={{
              boxSizing: 'border-box'
            }}
            // onSkipRender={onAppear}
            // onItemRemove={onAppear}
          >
            {(item, index) => <ForwardMyItem account={item.account} />}
          </VirtualList>
        </div>
      </Content>
      <FooterBackButton />
    </Layout>
  );
}
