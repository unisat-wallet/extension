import { useEffect, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import { Button, Card, Column, Content, Grid, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportMnemonicsScreen() {
  const { keyring } = useLocationState<{ keyring: WalletKeyring }>();

  const { t } = useI18n();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [mnemonic, setMnemonic] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const tools = useTools();

  const [passphrase, setPassphrase] = useState('');

  const btnClick = async () => {
    try {
      const { mnemonic, hdPath, passphrase } = await wallet.getMnemonics(password, keyring);
      setMnemonic(mnemonic);
      setPassphrase(passphrase);
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
  const words = mnemonic.split(' ');

  const pathName = ADDRESS_TYPES.find((v) => v.hdPath === keyring.hdPath)?.name || 'custom';
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('secret_recovery_phrase')}
      />

      <Content>
        {mnemonic == '' ? (
          <Column>
            <Card>
              <Column gap="lg">
                <Text text={t('if_you_lose_your_secret_recovery_phrase_your_asset')} preset="title-bold" color="red" />

                <Text text={t('if_you_share_the_secret_recovery_phrase_to_others_')} preset="title-bold" color="red" />

                <Text text={t('secret_recovery_phrase_is_only_stored_in_your_brow')} preset="title-bold" color="red" />
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
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button disabled={disabled} text={t('show_secret_recovery_phrase')} preset="primary" onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text
              text={t('this_phrase_is_the_only_way_to_recover_your_wallet')}
              color="warning"
              textCenter
              mt="xl"
              mb="xl"
            />

            <Row justifyCenter>
              <Grid columns={2}>
                {words.map((v, index) => {
                  return (
                    <Row key={index}>
                      <Text text={`${index + 1}. `} style={{ width: 40 }} />
                      <Card preset="style2" style={{ width: 200 }}>
                        <Text text={v} selectText disableTranslate />
                      </Card>
                    </Row>
                  );
                })}
              </Grid>
            </Row>
            <Card>
              <Column>
                <Text text={t('advance_options')} />
                <Text
                  text={`${t('derivation_path')}: ${keyring.hdPath}/0 (${pathName})`}
                  preset="sub"
                  onClick={() => {
                    copy(keyring.hdPath);
                  }}
                  disableTranslate
                />
                {passphrase && <Text text={`${t('passphrase')}: ${passphrase}`} preset="sub" disableTranslate />}
              </Column>
            </Card>
          </Column>
        )}
      </Content>
    </Layout>
  );
}
