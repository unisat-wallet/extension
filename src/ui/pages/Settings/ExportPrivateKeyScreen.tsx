import { Button, Input, Layout, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Account } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { copyToClipboard, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportPrivateKeyScreen() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const btnClick = async () => {
    try {
      const _res = await wallet.getPrivateKey(password, account);
      setPrivateKey(_res);
    } catch (e) {
      setStatus('error');
      setError((e as any).message);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    setDisabled(true);
    if (password) {
      setDisabled(false);
      setStatus('');
      setError('');
    }
  }, [password]);

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      message.success({
        duration: 3,
        content: t('copied')
      });
    });
  }

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Export Private Key"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 justify-evenly">
          {privateKey == '' ? (
            <div className="flex flex-col items-strech text-center gap-3_75 justify-evenly">
              <div className="text-warn box">{t('Type your password')}</div>
              <div className="mt-1_25">
                <Input.Password
                  className="box"
                  status={status}
                  placeholder={t('Password')}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  onKeyUp={(e) => handleOnKeyUp(e)}
                  autoFocus={true}
                />
              </div>
              {error ? <div className="text-lg text-error">{error}</div> : <></>}

              <Button disabled={disabled} size="large" type="primary" className="box content" onClick={btnClick}>
                {t('Show Private Key')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-strech gap-5 text-center justify-evenly">
              <div className="text-lg text-soft-white">
                {t('If you ever change browsers or move computers')},{' '}
                {t('you will need this Private Key to access this account')}.{t('Save it somewhere safe and secret')}.
              </div>
              <div
                className="grid w-full grid-cols-6 p-5 select-text box default hover text-4_5 leading-6_5 cursor-pointer"
                onClick={(e) => {
                  copy(privateKey);
                }}>
                <div className="flex items-center">
                  <img src="./images/copy-solid.svg" alt="" />
                </div>
                <div className="flex items-center col-span-5 overflow-hidden font-semibold text-soft-white overflow-ellipsis">
                  {privateKey}
                </div>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
