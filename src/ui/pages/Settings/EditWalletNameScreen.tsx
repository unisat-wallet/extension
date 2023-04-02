import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout } from '@/ui/components';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditWalletNameScreen() {
  const { state } = useLocation();
  const { keyring } = state as {
    keyring: WalletKeyring;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newKeyring = await wallet.setKeyringAlianName(keyring, alianName || keyring.alianName);
    dispatch(keyringsActions.updateKeyringName(newKeyring));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const isValidName = useMemo(() => {
    if (alianName.length == 0) {
      return false;
    }
    return true;
  }, [alianName]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={keyring.alianName}
      />
      <Content>
        <Column gap="lg">
          <Input
            placeholder={keyring.alianName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
          <Button
            disabled={!isValidName}
            text="Change Wallet Name"
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
