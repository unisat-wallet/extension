import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Account } from '@/shared/types';
import { Button, Input, Layout, Icon, Content, Header, Text, Column, Card, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
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
  const tools = useTools();

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
    copyToClipboard(str);
    tools.toastSuccess('Copied');
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Export Private Key"
      />
      <Content>
        {privateKey == '' ? (
          <Column gap="lg">
            <Text text="Type your password" preset="title" color="warning" textCenter my="xl" />
            <Input
              preset="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button text="Show Private Key" preset="primary" disabled={disabled} onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text
              text="If you ever change browsers or move computers, you will need this Private Key to access this account. Save it somewhere safe and secret"
              preset="sub"
              size="sm"
              textCenter
            />

            <Card
              onClick={(e) => {
                copy(privateKey);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={privateKey}
                  color="textDim"
                  style={{
                    overflowWrap: 'anywhere'
                  }}
                />
              </Row>
            </Card>
          </Column>
        )}
      </Content>
    </Layout>
  );
}
