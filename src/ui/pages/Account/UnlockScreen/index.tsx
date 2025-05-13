import React, { useEffect, useState } from 'react';

import { Column, Content, Layout, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Logo } from '@/ui/components/Logo';
import { Text } from '@/ui/components/Text';
import { useI18n } from '@/ui/hooks/useI18n';
import { useIsUnlocked, useUnlockCallback } from '@/ui/state/global/hooks';
import { getUiType, useWallet } from '@/ui/utils';

import { useNavigate } from '../../MainRoute';

export default function UnlockScreen() {
  const { t } = useI18n();
  const wallet = useWallet();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const UIType = getUiType();
  const isInNotification = UIType.isNotification;
  const unlock = useUnlockCallback();
  const tools = useTools();
  const isUnlocked = useIsUnlocked();

  useEffect(() => {
    if (isUnlocked) {
      navigate('MainScreen');
    }
  }, [isUnlocked, navigate]);

  const [loading, setLoading] = useState(false);

  const btnClick = async () => {
    try {
      if (loading) {
        return;
      }
      setLoading(true);
      await unlock(password);

      if (!isInNotification) {
        const hasVault = await wallet.hasVault();
        if (!hasVault) {
          navigate('WelcomeScreen');
          return;
        } else {
          navigate('MainScreen');
          return;
        }
      }
    } catch (e) {
      console.log(e);
      tools.toastError(t('password_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    if (password && loading === false) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password]);
  return (
    <Layout>
      <Content preset="middle">
        <Column fullX>
          <Row justifyCenter>
            <Logo preset="large" />
          </Row>

          <Column gap="xl" mt="xxl">
            <Text preset="title-bold" text={t('enter_your_password')} textCenter />
            <Input
              preset="password"
              placeholder={t('password')}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            <Button disabled={disabled} text={t('unlock')} preset="primary" onClick={btnClick} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
