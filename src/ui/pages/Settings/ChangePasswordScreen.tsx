import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Layout, Header, Content, Column } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

type Status = '' | 'error' | 'warning' | undefined;

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [passwordC, setPasswordC] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [statusC, setStatusC] = useState<Status>('');
  const [status1, setStatus1] = useState<Status>('');
  const [status2, setStatus2] = useState<Status>('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  const tools = useTools();

  useEffect(() => {
    setDisabled(true);
    if (password) {
      if (password.length < 6) {
        tools.toastWarning('at least five characters');
        setStatus1('error');
        return;
      }

      setStatus1('');

      if (password !== password2) {
        tools.toastWarning('Entered passwords differ');
        setStatus2('error');
        return;
      }
      setStatus2('');

      if (passwordC) {
        setDisabled(false);
      }
    }
  }, [passwordC, password, password2]);

  const handleOnBlur = (e, type: string) => {
    switch (type) {
      case 'password':
        setPassword(e.target.value);
        break;
      case 'password2':
        setPassword2(e.target.value);
        break;
      case 'passwordC':
        setPasswordC(e.target.value);
        break;
    }
  };

  const verify = async () => {
    try {
      await wallet.changePassword(passwordC, password);
      tools.toastSuccess('Success');
      navigate('MainScreen');
    } catch (err) {
      tools.toastError((err as any).message);
    }
  };
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Change Password"
      />
      <Content>
        <Column gap="lg">
          <Input
            preset="password"
            placeholder="Current Password"
            onBlur={(e) => {
              handleOnBlur(e, 'passwordC');
            }}
            autoFocus={true}
          />
          <Input
            preset="password"
            placeholder="New Password"
            onBlur={(e) => {
              handleOnBlur(e, 'password');
            }}
          />
          <Input
            preset="password"
            placeholder="Confirm Password"
            onBlur={(e) => {
              handleOnBlur(e, 'password2');
            }}
          />
          <Button
            disabled={disabled}
            text="Change Password"
            preset="primary"
            onClick={() => {
              verify();
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
