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
  const [originPassword, setOriginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  const tools = useTools();

  useEffect(() => {
    if (originPassword.length > 0 && newPassword.length >= 5 && newPassword === confirmPassword) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [originPassword, newPassword, confirmPassword]);

  const verify = async () => {
    try {
      await wallet.changePassword(originPassword, newPassword);
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
            onChange={(e) => {
              setOriginPassword(e.target.value);
            }}
            autoFocus={true}
          />
          <Input
            preset="password"
            placeholder="New Password"
            onBlur={(e) => {
              if (newPassword.length < 5) {
                tools.toastWarning('at least five characters');
                return;
              }
              if (newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword) {
                tools.toastWarning('Entered passwords differ');
              }
            }}
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
          />
          <Input
            preset="password"
            placeholder="Confirm Password"
            onBlur={(e) => {
              if (newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword) {
                tools.toastWarning('Entered passwords differ');
              }
            }}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
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
