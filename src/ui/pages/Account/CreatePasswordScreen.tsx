import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button, Column, Content, Input, Layout, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useWallet, useWalletRequest } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

type Status = '' | 'error' | 'warning' | undefined;

export default function CreatePasswordScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  let state = {};
  if (loc.state) {
    state = loc.state;
  }
  if (params.size > 0) {
    params.forEach((value, key) => {
      state[key] = value;
    })
  }
  const { isNewAccount, isKeystone } = state as { isNewAccount: boolean; isKeystone: boolean };
  const [password, setPassword] = useState('');

  const [password2, setPassword2] = useState('');

  const [disabled, setDisabled] = useState(true);

  const tools = useTools();
  const [run, loading] = useWalletRequest(wallet.boot, {
    onSuccess() {
      if (isKeystone) {
        navigate('CreateKeystoneWalletScreen', { fromUnlock: true });
      } else if (isNewAccount) {
        navigate('CreateHDWalletScreen', { isImport: false, fromUnlock: true });
      } else {
        navigate('CreateHDWalletScreen', { isImport: true, fromUnlock: true });
      }
    },
    onError(err) {
      tools.toastError(err);
    }
  });

  const btnClick = () => {
    run(password.trim());
  };

  const verify = (pwd2: string) => {
    if (pwd2 && pwd2 !== password) {
      tools.toastWarning('Entered passwords differ');
    }
  };

  useEffect(() => {
    setDisabled(true);

    if (password) {
      if (password.length < 5) {
        tools.toastWarning('Password must contain at least 5 characters');
        return;
      }

      if (password2) {
        if (password === password2) {
          setDisabled(false);
          return;
        }
      }
    }
  }, [password, password2]);

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  return (
    <Layout>
      <Content preset="middle">
        <Column fullX>
          <Column gap="xl" mt="xxl">
            <Text text="Create a password" preset="title-bold" textCenter />
            <Text text="You will use this to unlock your wallet" preset="sub" textCenter />
            <Input
              preset="password"
              onBlur={(e) => {
                setPassword(e.target.value);
              }}
              autoFocus={true}
            />
            <Input
              preset="password"
              placeholder="Confirm Password"
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
              onBlur={(e) => {
                verify(e.target.value);
              }}
              onKeyUp={(e) => handleOnKeyUp(e)}
            />
            <Button disabled={disabled} text="Continue" preset="primary" onClick={btnClick} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
