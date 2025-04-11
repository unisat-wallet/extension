import { networks } from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import * as ecc from 'tiny-secp256k1';

import { Account } from '@/shared/types';
import { Button, Card, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { sizes } from '@/ui/theme/spacing';
import { copyToClipboard, useWallet } from '@/ui/utils';

const ECPair = ECPairFactory(ecc);

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportPrivateKeyScreen() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [privateKey, setPrivateKey] = useState({ hex: '', wif: '' });
  const [publicKey, setPublicKey] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();
  const tools = useTools();

  const btnClick = async () => {
    try {
      const _res = await wallet.getPrivateKey(password, account);
      setPrivateKey(_res);
      const keyPair = ECPair.fromWIF(_res.wif, networks.bitcoin);
      const pubKey = keyPair.publicKey.toString('hex');
      setPublicKey(pubKey);
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
        {privateKey.wif == '' ? (
          <Column gap="lg">
            <Card>
              <Column gap="lg">
                <Text text="If you lose your Private Key, your assets will be gone!" preset="title-bold" color="red" />

                <Text
                  text="If you share the Private Key to others, your assets will be stolen!"
                  preset="title-bold"
                  color="red"
                />

                <Text
                  text="Private Key is only stored in your browser, it is your responsibilities to keep the Private Key safe!"
                  preset="title-bold"
                  color="red"
                />
              </Column>
            </Card>

            <Text
              text=" Please make sure you have read the security tips above before typing your password"
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

            <Text text="WIF Private Key:" preset="sub" size="sm" textCenter mt="lg" />
            <Content>
              <Column gap="xl" mt="lg">
                <Column
                  justifyCenter
                  rounded
                  style={{ backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', padding: 10 }}>
                  <QRCode value={privateKey.wif || ''} renderAs="svg" size={sizes.qrcode}></QRCode>
                </Column>
              </Column>
            </Content>
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

            <Text text="Hex Private Key:" preset="sub" size="sm" textCenter mt="lg" />

            <Content>
              <Column gap="xl" mt="lg">
                <Column
                  justifyCenter
                  rounded
                  style={{ backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', padding: 10 }}>
                  <QRCode value={privateKey.hex || ''} renderAs="svg" size={sizes.qrcode}></QRCode>
                </Column>
              </Column>
            </Content>
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
            <Text text="Public Key:" preset="sub" size="sm" textCenter mt="lg" />

            <Content>
              <Column gap="xl" mt="lg">
                <Column
                  justifyCenter
                  rounded
                  style={{ backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', padding: 10 }}>
                  <QRCode value={publicKey || ''} renderAs="svg" size={sizes.qrcode}></QRCode>
                </Column>
              </Column>
            </Content>
            <Card
              onClick={(e) => {
                copy(publicKey);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={publicKey}
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
