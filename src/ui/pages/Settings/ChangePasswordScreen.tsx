import { useEffect, useMemo, useState } from 'react';

import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useWallet } from '@/ui/utils';
import { getPasswordStrengthWord, MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { useNavigate } from '../MainRoute';

type Status = '' | 'error' | 'warning' | undefined;

export default function ChangePasswordScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [originPassword, setOriginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  const tools = useTools();

  const [loading, setLoading] = useState(false);

  const strongText = useMemo(() => {
    if (!newPassword) {
      return;
    }
    const { text, color, tip } = getPasswordStrengthWord(newPassword);

    return (
      <Column>
        <Row>
          <Text size="xs" text={`${t('password_strength')}: `} />
          <Text size="xs" text={text} style={{ color: color }} />
        </Row>
        {tip ? <Text size="xs" preset="sub" text={tip} /> : null}
      </Column>
    );
  }, [newPassword]);

  const matchText = useMemo(() => {
    if (!confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return (
        <Row>
          <Text size="xs" text={t('passwords_dont_match')} color="red" />
        </Row>
      );
    } else {
      return;
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (
      originPassword.length > 0 &&
      newPassword.length >= MIN_PASSWORD_LENGTH &&
      newPassword === confirmPassword &&
      loading === false
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [originPassword, newPassword, confirmPassword]);

  const verify = async () => {
    try {
      if (loading) {
        return;
      }
      setLoading(true);
      await wallet.changePassword(originPassword, newPassword);
      tools.toastSuccess(t('success'));
      navigate('MainScreen');
    } catch (err) {
      tools.toastError((err as any).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('change_password')}
      />
      <Content>
        <Column gap="lg">
          <Input
            preset="password"
            placeholder={t('current_password')}
            onChange={(e) => {
              setOriginPassword(e.target.value);
            }}
            autoFocus={true}
          />
          <Input
            preset="password"
            placeholder={t('new_password')}
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
          />
          {strongText}
          <Input
            preset="password"
            placeholder={t('confirm_password')}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          {matchText}
          <Button
            disabled={disabled}
            text={t('change_password')}
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
