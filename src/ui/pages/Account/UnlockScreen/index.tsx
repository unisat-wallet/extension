import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUnlockCallback } from '@/ui/state/global/hooks';
import { getUiType, useWallet } from '@/ui/utils';

import { useNavigate } from '../../MainRoute';

export default function UnlockScreen() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const UIType = getUiType();
  const isInNotification = UIType.isNotification;
  const unlock = useUnlockCallback();
  const btnClick = async () => {
    // run(password);
    try {
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
      message.error(t('PASSWORD ERROR'));
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    if (password) {
      setDisabled(false);
    }
  }, [password]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-15 gap-x-4 w-70">
          <img src="./images/wallet-logo.png" className="w-16 h-16 select-none" alt="" />
          <div className="text-4xl font-semibold tracking-widest select-none">UNISAT</div>
        </div>
        <div className="grid gap-5">
          <div className="text-2xl font-semibold text-center text-white">{t('Enter your password')}</div>
          <div>
            <Input.Password
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
          </div>
          <div>
            <Button
              disabled={disabled}
              size="large"
              type="primary"
              className="font-semibold box w380 content"
              onClick={btnClick}>
              {t('Unlock')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
