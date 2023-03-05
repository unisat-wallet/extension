import { Button, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import { publicKeyToAddress } from '@/background/utils/tx-utils';
import { ADDRESS_TYPES } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAddressType, useChangeAddressTypeCallback, useNetworkType } from '@/ui/state/settings/hooks';
import { shortAddress } from '@/ui/utils';

export default function AddressTypeScreen() {
  const { t } = useTranslation();
  const type = useAddressType();
  const networkType = useNetworkType();
  const changeAddressType = useChangeAddressTypeCallback();
  const currentAccount = useCurrentAccount();
  const isInTab = useExtensionIsInTab();
  return (
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <div className="flex flex-col px-2 text-2xl font-semibold h-13 text-center">{t('Address Type')}</div>
          <div className="text-warn box self-center">{'This will not switch your derivation path'}</div>
          {ADDRESS_TYPES.map((item, index) => {
            const displayAddress = publicKeyToAddress(currentAccount.address, item.value, networkType);
            return (
              <Button
                key={index}
                size="large"
                type="default"
                className="box default"
                onClick={() => {
                  changeAddressType(item.value);
                }}>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <div className="flex flex-start">
                    <div className="w-32 text-left">{t(item.label)}</div>
                    <div className="font-normal opacity-60">
                      {isInTab ? displayAddress : shortAddress(displayAddress, 10)}
                    </div>
                  </div>

                  {item.value == type ? (
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
      </Content>
    </Layout>
  );
}
