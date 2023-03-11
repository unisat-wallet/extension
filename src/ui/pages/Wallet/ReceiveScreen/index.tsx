import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

import { KEYRING_CLASS } from '@/shared/constant';
import { AddressBar } from '@/ui/components/AddressBar';
import CHeader from '@/ui/components/CHeader';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';

import './index.less';

export default function ReceiveScreen() {
  const [size, setSize] = useState(210);

  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  useEffect(() => {
    const html = document.getElementsByTagName('html')[0];
    if (html && getComputedStyle(html).fontSize) {
      setSize((210 * parseFloat(getComputedStyle(html).fontSize)) / 16);
    }
  }, []);

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Address"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-center gap-10 mx-auto mt-5 justify-evenly w-110">
          <div className="flex items-center justify-center bg-white rounded h-60 w-60">
            <QRCode value={address || ''} renderAs="svg" size={size}></QRCode>
          </div>
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex flex-row items-center gap-2_5">
              {/* <FontAwesomeIcon className="icon" icon={faUser} /> */}
              <img src="./images/user-solid.svg" alt="" />
              <span className="text-lg font-semibold">{currentAccount?.alianName}</span>
              {currentAccount?.type == KEYRING_CLASS.PRIVATE_KEY ? (
                <div className="rounded bg-primary-active py-1_25 px-2_5">
                  <div className="text-xs font-medium">
                    <span>IMPORTED</span>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            <AddressBar />
            {/* <span className="font-normal text-soft-white mt-2_5">{t('This address can only receive NFT')}</span> */}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
