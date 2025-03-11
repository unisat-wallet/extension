import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account } from '@/shared/types';
import { Button, Content, Header, Input, Layout } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditAccountNameScreen() {
  const { t } = useI18n();

  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState(account.alianName || '');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newAccount = await wallet.setAccountAlianName(account, alianName);
    dispatch(keyringsActions.updateAccountName(newAccount));
    dispatch(accountActions.updateAccountName(newAccount));
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
    const name = account.alianName || '';
    if (name.length > 20) {
      return name.slice(0, 10) + '...';
    }
    return name;
  }, [account.alianName]);

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
          placeholder={account.alianName}
          defaultValue={account.alianName}
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
          text={t('change_account_name')}
          preset="primary"
          onClick={(e) => {
            handleOnClick();
          }}
        />
      </Content>
    </Layout>
  );
}
