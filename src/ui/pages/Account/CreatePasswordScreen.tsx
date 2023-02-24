import { Button, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useWallet, useWalletRequest } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

type Status = '' | 'error' | 'warning' | undefined;

export default function CreatePasswordScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const wallet = useWallet();
  const { state } = useLocation();
  const { isNewAccount } = state as { isNewAccount: boolean };
  const [password, setPassword] = useState('');
  const [status1, setStatus1] = useState<Status>('');

  const [password2, setPassword2] = useState('');
  const [status2, setStatus2] = useState<Status>('');

  const [disabled, setDisabled] = useState(true);

  const [run, loading] = useWalletRequest(wallet.boot, {
    onSuccess() {
      if (isNewAccount) {
        navigate('CreateMnemonicsScreen');
      } else {
        navigate('ImportMnemonicsScreen');
      }
    },
    onError(err) {
      message.error(err);
    }
  });

  const btnClick = () => {
    run(password.trim());
  };

  const verify = (pwd2: string) => {
    if (pwd2 && pwd2 !== password) {
      setStatus2('error');
      message.warning(t('Entered passwords differ'));
    }
  };

  useEffect(() => {
    setDisabled(true);

    if (password) {
      if (password.length < 5) {
        message.warning(t('Password must contain at least 5 characters'));
        setStatus1('error');
        return;
      }

      if (password2) {
        if (password === password2) {
          setStatus1('');
          setStatus2('');
          setDisabled(false);
          return;
        }
      }
    }

    setStatus1('');
    setStatus2('');
  }, [password, password2]);

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  return (
    <div className="flex justify-center pt-45">
      <div className="flex flex-col justify-center text-center gap-2_5">
        <div className="text-2xl font-semibold text-white box w380">{t('Create a password')}</div>
        <div className="text-lg text-soft-white box w380">{t('You will use this to unlock your wallet')}</div>
        <Input.Password
          status={status1}
          className="font-semibold text-white mt-12_5 box focus:active"
          placeholder={t('Password')}
          onBlur={(e) => {
            setPassword(e.target.value);
          }}
          autoFocus={true}
        />
        <Input.Password
          status={status2}
          className="font-semibold text-white mt-2_5 box focus:active"
          placeholder={t('Confirm Password')}
          onChange={(e) => {
            setPassword2(e.target.value);
          }}
          onBlur={(e) => {
            verify(e.target.value);
          }}
          onKeyUp={(e) => handleOnKeyUp(e)}
        />
        <div className="mt-2_5">
          <Button disabled={disabled} size="large" type="primary" className="box w380 content" onClick={btnClick}>
            {t('Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
