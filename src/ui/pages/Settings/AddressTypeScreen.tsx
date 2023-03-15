import { Button, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADDRESS_TYPES, KEYRING_TYPE } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { amountToSaothis, shortAddress, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

export default function AddressTypeScreen() {
  const { t } = useTranslation();
  const isInTab = useExtensionIsInTab();

  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const account = useCurrentAccount();

  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressBalances, setAddressBalances] = useState<{ [key: string]: { amount: string; satoshis: number } }>({});
  const [loading, setLoading] = useState(true);
  const selfRef = useRef<{
    addressBalances: { [key: string]: { amount: string; satoshis: number } };
  }>({
    addressBalances: {}
  });
  const self = selfRef.current;
  const loadAddresses = async () => {
    const _res = await wallet.getAllAddresses(currentKeyring, account.index || 0);
    setAddresses(_res);
    const balances = await wallet.getMultiAddressBalance(_res.join(','));
    for (let i = 0; i < _res.length; i++) {
      const address = _res[i];
      const balance = balances[i];
      const satoshis = amountToSaothis(balance.amount);
      self.addressBalances[address] = {
        amount: balance.amount,
        satoshis
      };
    }
    setAddressBalances(self.addressBalances);
    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const addressTypes = useMemo(() => {
    if (currentKeyring.type === KEYRING_TYPE.HdKeyring) {
      return ADDRESS_TYPES.filter((v) => {
        if (v.displayIndex < 0) {
          return false;
        }
        const address = addresses[v.value];
        const balance = addressBalances[address];
        if (v.isUnisatLegacy) {
          if (!balance || balance.satoshis == 0) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => a.displayIndex - b.displayIndex);
    } else {
      return ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && v.isUnisatLegacy != true).sort(
        (a, b) => a.displayIndex - b.displayIndex
      );
    }
  }, [currentKeyring.type, addressBalances, addresses]);

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Address Type"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        {loading ? (
          <div className="flex flex-col items-strech mx-5 text-6xl mt-60 gap-3_75 text-primary">
            <LoadingOutlined />
          </div>
        ) : (
          <div className="flex flex-col items-strech  gap-3_75 justify-evenly mx-5">
            {addressTypes.map((item, index) => {
              const address = addresses[item.value];
              const balance = addressBalances[address] || {
                amount: '--',
                satoshis: 0
              };
              const hasVault = balance.satoshis > 0;
              return (
                <Button
                  key={index}
                  size="large"
                  type="default"
                  className="box default !h-32"
                  onClick={async () => {
                    await wallet.changeAddressType(item.value);
                    window.location.reload();
                  }}>
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <div className="flex flex-col w-full text-left">
                      <div className="w-32 text-left">{`${item.name} (${item.hdPath}/${account.index})`}</div>
                      <div className={'font-normal ' + (balance.satoshis > 0 ? ' text-yellow-300' : 'opacity-60 ')}>
                        {isInTab ? address : shortAddress(address, 10)}
                      </div>
                      {hasVault && <div className="border-b-2  opacity-60 w-full"></div>}
                      {hasVault && (
                        <div
                          className={
                            'flex justify-start  ' + (balance.satoshis > 0 ? ' text-yellow-300' : 'opacity-60 ')
                          }>{`${balance.amount} BTC`}</div>
                      )}
                    </div>

                    {item.value == currentKeyring.addressType ? (
                      <span className="w-4 h-4">
                        <img src="./images/check.svg" alt="" />
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </Content>
    </Layout>
  );
}
