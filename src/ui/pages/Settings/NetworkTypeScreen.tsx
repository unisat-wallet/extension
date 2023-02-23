import { Button, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import { NETWORK_TYPES } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useChangeNetworkTypeCallback, useNetworkType } from '@/ui/state/settings/hooks';

export default function NetworkTypeScreen() {
  const { t } = useTranslation();
  const networkType = useNetworkType();
  const changeNetworkType = useChangeNetworkTypeCallback();
  return (
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <div className="flex flex-col px-2 text-2xl font-semibold h-13 text-center">{t('Network')}</div>
          {NETWORK_TYPES.map((item, index) => {
            return (
              <Button
                key={index}
                size="large"
                type="default"
                className="box default"
                onClick={async () => {
                  await changeNetworkType(item.value);
                  window.location.reload();
                }}>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <div className="flex flex-start">
                    <div className="w-32 text-left">{t(item.label)}</div>
                  </div>

                  {item.value == networkType ? (
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
      <FooterBackButton />
    </Layout>
  );
}
