import { useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES, KEYRING_TYPE } from '@/shared/constant';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { amountToSaothis, shortAddress, useWallet } from '@/ui/utils';

export default function AddressTypeScreen() {
  const isInTab = useExtensionIsInTab();

  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const account = useCurrentAccount();

  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressBalances, setAddressBalances] = useState<{ [key: string]: { amount: string; satoshis: number } }>({});

  const selfRef = useRef<{
    addressBalances: { [key: string]: { amount: string; satoshis: number } };
  }>({
    addressBalances: {}
  });
  const self = selfRef.current;

  const tools = useTools();
  const loadAddresses = async () => {
    tools.showLoading(true);

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

    tools.showLoading(false);
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
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Address Type"
      />
      <Content>
        <Column>
          {addressTypes.map((item, index) => {
            const address = addresses[item.value];
            const balance = addressBalances[address] || {
              amount: '--',
              satoshis: 0
            };
            const hasVault = balance.satoshis > 0;
            return (
              <Card
                preset="style1"
                key={index}
                onClick={async () => {
                  await wallet.changeAddressType(item.value);
                  window.location.reload();
                }}>
                <Row justifyBetween full>
                  <Column justifyCenter>
                    <Text text={`${item.name} (${item.hdPath}/${account.index})`} />
                    <Text
                      text={shortAddress(address)}
                      preset="sub"
                      // color={balance.satoshis > 0 ? colors.yellow : colors.white_muted}
                    />

                    {hasVault && <Text text={`${balance.amount} BTC`} color="yellow" />}
                  </Column>

                  <Column justifyCenter>{item.value == currentKeyring.addressType && <Icon icon="check" />}</Column>
                </Row>
              </Card>
            );
          })}
        </Column>
      </Content>
    </Layout>
  );
}
