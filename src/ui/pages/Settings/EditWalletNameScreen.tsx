import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/shared/types';
import { Button, Content, Header, Input, Layout } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditWalletNameScreen() {
  const { state } = useLocation();
  const { keyring } = state as {
    keyring: WalletKeyring;
  };
  const { t } = useI18n();
  const wallet = useWallet();
  const [alianName, setAlianName] = useState(keyring.alianName || '');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newKeyring = await wallet.setKeyringAlianName(keyring, alianName || keyring.alianName);
    dispatch(keyringsActions.updateKeyringName(newKeyring));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if ('Enter' == e.key && e.ctrlKey) {
      handleOnClick();
    }
  };

  const isValidName = useMemo(() => {
    if (alianName.length == 0) {
      return false;
    }
    return true;
  }, [alianName]);

  const truncatedTitle = useMemo(() => {
    if (keyring.alianName && keyring.alianName.length > 20) {
      return keyring.alianName.slice(0, 20) + '...';
    }
    return keyring.alianName || '';
  }, [keyring.alianName]);

  return (
    <Layout>
      <div style={{ position: 'relative' }}>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title={truncatedTitle}
        />
      </div>
      <Content>
        <Input
          placeholder={keyring.alianName}
          defaultValue={keyring.alianName}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              setAlianName(e.target.value);
            }
          }}
          onKeyUp={(e) => handleOnKeyUp(e)}
          autoFocus={true}
          maxLength={20}
        />
        <Button
          disabled={!isValidName}
          text={t('change_wallet_name')}
          preset="primary"
          onClick={(e) => {
            handleOnClick();
          }}
        />
      </Content>
    </Layout>
  );
}
