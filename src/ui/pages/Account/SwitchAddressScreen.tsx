import { Button } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';

import { KEYRING_CLASS } from '@/shared/constant';
import { Account } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useAccounts, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { shortAddress, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface AccountTmp {
  oper: 'add' | null;
  type: string;
  pubkey: string;
  address: string;
  brandName: string;
  alianName?: string;
  displayBrandName?: string;
  index?: number;
  balance?: number;
}

interface MyItemProps {
  t: TFunction<'translation', undefined>;
  index: number;
  account: Account;
  accountIndex: number;
  onClick(num: number): void;
  oper: 'add' | undefined | null;
}

const MyItem: React.ForwardRefRenderFunction<any, MyItemProps> = (
  { t, index, account, accountIndex: currency, onClick, oper }: MyItemProps,
  ref
) => {
  return 'add' == oper ? (
    <Button
      size="large"
      type="primary"
      className="box w-115"
      onClick={(e) => {
        // todo
      }}>
      <div className="flex items-center justify-center text-lg font-semibold">{t('Add New Account')}</div>
    </Button>
  ) : (
    <Button
      size="large"
      type="default"
      className="p-5 box w-115 default mb-3_75 btn-88"
      onClick={(e) => {
        onClick(index);
      }}>
      <div className="flex items-center justify-between text-lg font-semibold">
        <div className="flex flex-col flex-grow text-left">
          <span>{account.alianName} </span>
          <span className="font-normal opacity-60">({shortAddress(account.address)})</span>
        </div>
        {account?.type == KEYRING_CLASS.PRIVATE_KEY ? (
          <span className="text-xs rounded bg-primary-active p-1.5">IMPORTED</span>
        ) : (
          <></>
        )}
        {currency == index ? (
          <span className="w-4 ml-2_5">
            <img src="./images/check.svg" alt="" />
          </span>
        ) : (
          <span className="w-4 ml-2_5"></span>
        )}
      </div>
    </Button>
  );
};

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

export default function SwitchAddressScreen() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const navigate = useNavigate();
  const listRef = useRef<ListRef>(null);

  const html = document.getElementsByTagName('html')[0];
  let virtualListHeight = 500;
  if (html && getComputedStyle(html).fontSize) {
    virtualListHeight = (virtualListHeight * parseFloat(getComputedStyle(html).fontSize)) / 16;
  }

  const currentAccount = useCurrentAccount();
  const accountsList = useAccounts();

  const [accountsTmpList, setAccountTmpList] = useState<AccountTmp[]>(
    accountsList
      ?.map((item, index) => {
        const tmp = item as AccountTmp;
        tmp.oper = null;
        return tmp;
      })
      .concat({ oper: 'add', index: 999, address: 'NOT_ADDRESS_1' } as AccountTmp)
  );

  const [accountIndex, setAccountIndex] = useState(accountsList.findIndex((v) => v.address == currentAccount?.address));

  const ForwardMyItem = forwardRef(MyItem);

  useEffect(() => {
    setAccountIndex(accountsList.findIndex((v) => v.address == currentAccount?.address));

    setAccountTmpList(
      accountsList
        ?.map((item, index) => {
          const tmp = item as AccountTmp;
          tmp.oper = null;
          return tmp;
        })
        .concat({ oper: 'add', index: 999, address: 'NOT_ADDRESS_1' } as AccountTmp)
    );
  }, [currentAccount]);

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Switch Account"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-center mx-auto mt-5 gap-3_75 justify-evenly w-95">
          <div className="flex items-center px-2 text-2xl font-semibold h-13">{t('Switch Account')}</div>
          <VirtualList
            data={accountsTmpList}
            data-id="list"
            height={virtualListHeight}
            itemHeight={20}
            itemKey={(item) => item.address}
            // disabled={animating}
            ref={listRef}
            style={{
              boxSizing: 'border-box'
            }}
            // onSkipRender={onAppear}
            // onItemRemove={onAppear}
          >
            {(item, index) => (
              <ForwardMyItem
                t={t}
                account={item}
                index={index}
                oper={item.oper}
                accountIndex={accountIndex}
                onClick={async (index) => {
                  if (index != accountIndex) {
                    await wallet.changeAccount(accountsList[index]);
                  }
                  navigate('MainScreen');
                }}
              />
            )}
          </VirtualList>
        </div>
      </Content>
    </Layout>
  );
}
