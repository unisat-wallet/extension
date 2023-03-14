import { Button, Input, Layout, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KEYRING_TYPE } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useAccounts, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { copyToClipboard, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportPrivateKeyScreen() {
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const accountsList = useAccounts();
  const currentKeyring = useCurrentKeyring();
  const btnClick = async () => {
    try {
      const account = await wallet.getCurrentAccount();
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

  const accountIndex = currentKeyring.accounts.findIndex((v) => v.pubkey === currentAccount.pubkey);
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
              {currentAccount?.type == KEYRING_TYPE.HdKeyring ? (
                <div className="text-soft-white -mt-2_5">
                  {`Derivation Path: ${currentKeyring.hdPath}/${accountIndex}`}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
