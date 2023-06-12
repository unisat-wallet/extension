import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADDRESS_TYPES } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import { Button, Input, Layout, Content, Icon, Header, Text, Column, Row, Card, Grid } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportMnemonicsScreen() {
  const { keyring } = useLocationState<{ keyring: WalletKeyring }>();

  const { t } = useTranslation();

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
    tools.toastSuccess('Copied');
  }
  const words = mnemonic.split(' ');

  const pathName = ADDRESS_TYPES.find((v) => v.hdPath === keyring.hdPath)?.name;
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Secret Recovery Phrase"
      />

      <Content>
        {mnemonic == '' ? (
          <Column>
            <Text text="Type your password" preset="title" color="warning" textCenter mt="xl" mb="xl" />

            <Input
              preset="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyUp={(e) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button disabled={disabled} text="Show Secret Recovery Phrase" preset="primary" onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text
              text="This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone! (click to copy)"
              color="warning"
              textCenter
              mt="xl"
              mb="xl"
            />

            <Row
              justifyCenter
              onClick={(e) => {
                copy(mnemonic);
              }}>
              <Icon icon="copy" color="textDim" />
              <Text text="Copy to clipboard" color="textDim" />
            </Row>

            <Row justifyCenter>
              <Grid columns={2}>
                {words.map((v, index) => {
                  return (
                    <Row key={index}>
                      <Text text={`${index + 1}. `} style={{ width: 40 }} />
                      <Card preset="style2" style={{ width: 200 }}>
                        <Text text={v} selectText />
                      </Card>
                    </Row>
                  );
                })}
              </Grid>
            </Row>
            <Card>
              <Column>
                <Text text="Advance Options" />
                <Text
                  text={`Derivation Path: ${keyring.hdPath}/0 (${pathName})`}
                  preset="sub"
                  onClick={() => {
                    copy(keyring.hdPath);
                  }}
                />
                {passphrase && <Text text={`Passphrase: ${passphrase}`} preset="sub" />}
              </Column>
            </Card>
          </Column>
        )}
      </Content>
    </Layout>
  );
}
