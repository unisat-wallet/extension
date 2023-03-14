import { Button, Input } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditWalletNameScreen() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const keyring = await wallet.setKeyringAlianName(currentKeyring, alianName || currentKeyring.alianName);
    const keyrings = await wallet.getKeyrings();
    dispatch(keyringsActions.setCurrent(keyring));
    dispatch(keyringsActions.setKeyrings(keyrings));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title={currentKeyring.alianName}
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <Input
            className="font-semibold text-white mt-1_25 h-15_5 box default focus:active"
            placeholder={currentKeyring.alianName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
          <Button
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              handleOnClick();
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Change Wallet Name')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
