import { Column, Content, Header, Layout, Text } from '@/ui/components';
import { useImportAccountsFromKeystoneCallback } from '@/ui/state/global/hooks';
import { AnimatedQRScanner } from '@keystonehq/animated-qr';
import { AddressType } from '@unisat/wallet-sdk';
import { useState } from 'react';
import { useNavigate } from '../MainRoute';

export default function CreateKeystoneWalletScreen() {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState('');
  const importAccounts = useImportAccountsFromKeystoneCallback();
  const navigate = useNavigate();
  const onSucceed = async ({ type, cbor }) => {
    setResult(`${type}: ${cbor}`);
    await importAccounts(type, cbor, AddressType.P2PKH, 1);
    navigate('MainScreen');
  }
  const onError = (errorMessage) => {
    console.log('error: ', errorMessage);
  }
  const onProgress = (progress) => {
    setProgress(progress);
  }
  return <Layout>
    <Header
      title="Create Keystone Wallet"
    />
    <Content>
      <Column justifyCenter itemsCenter>
        <Text text="Scan QR Code" />
        {progress !== 100 && <AnimatedQRScanner handleScan={onSucceed} handleError={onError} urTypes={['crypto-account']} onProgress={onProgress} />}
        <Text text={`Progress: ${progress}%`} />
        <Text text={result} wrap />
      </Column>
    </Content>
  </Layout>;
}
