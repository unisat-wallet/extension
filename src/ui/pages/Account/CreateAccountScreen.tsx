import { useEffect, useState } from 'react';

import { Button, Column, Content, Header, Input, Layout } from '@/ui/components';
import { useCurrentKeyring, useI18n, useSetCurrentAccountCallback, useTools, useWallet } from '@unisat/wallet-state';

import { useNavigate } from '../MainRoute';

export default function CreateAccountScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();
  const setCurrentAccount = useSetCurrentAccountCallback();
  const currentKeyring = useCurrentKeyring();
  const [alianName, setAlianName] = useState('');
  const [defaultName, setDefaultName] = useState('');
  const { t } = useI18n();
  const handleOnClick = async () => {
    await wallet.deriveNewAccountFromMnemonic(currentKeyring, alianName || defaultName);
    tools.toastSuccess(t('success'));
    const currentAccount = await wallet.getCurrentAccount();
    setCurrentAccount(currentAccount);
    navigate('MainScreen');
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const init = async () => {
    const accountName = await wallet.getNextAlianName(currentKeyring);
    setDefaultName(accountName);
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('new_account')}
      />
      <Content>
        <Column>
          <Input
            placeholder={defaultName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e as any)}
            autoFocus={true}
          />
          <Button
            text={t('create_an_account')}
            preset="primary"
            onClick={(e) => {
              handleOnClick();
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
