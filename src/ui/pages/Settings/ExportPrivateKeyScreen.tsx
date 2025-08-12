import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account } from '@/shared/types';
import { Button, Card, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { copyToClipboard, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportPrivateKeyScreen() {
  const { t } = useI18n();

  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [privateKey, setPrivateKey] = useState({ hex: '', wif: '' });
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
    tools.toastSuccess(t('copied'));
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('export_private_key')}
      />
      <Content>
        {privateKey.wif == '' ? (
          <Column gap="lg">
            <Card>
              <Column gap="lg">
                <Text text={t('if_you_lose_your_private_key_your_assets_will_be_g')} preset="title-bold" color="red" />

                <Text text={t('if_you_share_the_private_key_to_others_your_assets')} preset="title-bold" color="red" />

                <Text text={t('private_key_is_only_stored_in_your_browser_it_is_y')} preset="title-bold" color="red" />
              </Column>
            </Card>

            <Text
              text={t('please_make_sure_you_have_read_the_security_tips_a')}
              preset="title"
              color="warning"
              textCenter
              my="xl"
            />
            <Input
              preset="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyUp={(e) => handleOnKeyUp(e as any)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button text={t('show_private_key')} preset="primary" disabled={disabled} onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text text={t('if_you_ever_change_browsers_or_move_computers_you_')} preset="sub" size="sm" textCenter />

            <Text text={t('wif_private_key')} preset="sub" size="sm" textCenter mt="lg" />

            <Card
              onClick={(e) => {
                copy(privateKey.wif);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={privateKey.wif}
                  color="textDim"
                  style={{
                    overflowWrap: 'anywhere'
                  }}
                />
              </Row>
            </Card>

            <Text text={t('hex_private_key')} preset="sub" size="sm" textCenter mt="lg" />

            <Card
              onClick={(e) => {
                copy(privateKey.hex);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={privateKey.hex}
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
