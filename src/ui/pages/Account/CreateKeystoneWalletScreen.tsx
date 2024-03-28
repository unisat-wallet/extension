import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressAssets } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import KeystoneLogo from '@/ui/components/Keystone/Logo';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystonePopover from '@/ui/components/Keystone/Popover';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import KeystoneProductImg from '@/ui/components/Keystone/imgs/keystone-product.png';
import { useImportAccountsFromKeystoneCallback } from '@/ui/state/global/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { ScanOutlined } from '@ant-design/icons';
import { AddressType } from '@unisat/wallet-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '../MainRoute';

interface ContextData {
  ur: {
    type: string
    cbor: string
  }
}

function Step1({ onNext }) {
  const navigate = useNavigate();

  return <Layout>
    <Header
      title="Connect Keystone"
      onBack={() => {
        navigate('MainScreen');
      }}
    />
    <Content style={{ marginTop: '24px' }}>
      <Column style={{
        background: 'linear-gradient(270deg, rgba(4, 5, 7, 0.00) 0.06%, #040507 8.94%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img src={KeystoneProductImg} style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'auto',
          height: '100%',
          zIndex: 1
        }} />
        <Column justifyCenter style={{
          padding: '72px 64px',
          gap: '24px',
          position: 'relative',
          zIndex: 2,
          width: '50%'
        }}>
          <KeystoneLogo width={64} height={64} />
          <Text text="Keystone hardware wallet" preset='title' />
          <Text text="The Ultimate Security Solution for Cryptocurrencies" preset='sub' style={{
            marginBottom: '40px'
          }} />
          <Card>100% Air-Gapped</Card>
          <Card>Open-source</Card>
          <Card>Exceptional Compatibility</Card>
          <Row justifyCenter>
            <a href='https://keyst.one/'>Learn more about keystone</a>
          </Row>
        </Column>
      </Column>
      <Button preset='primary' style={{ color: colors.black, marginTop: '24px' }} onClick={onNext}>
        <ScanOutlined style={{ marginRight: '8px' }} />
        <Text text="Scan to connect" color='black' />
      </Button>
    </Content>
  </Layout>;
}

function Step2({ onBack, onNext }) {
  const importAccounts = useImportAccountsFromKeystoneCallback();
  const [error, setError] = useState('');
  const onSucceed = useCallback(async ({ type, cbor }) => {
    try {
      await importAccounts(type, cbor, AddressType.P2PKH, 1);
      onNext({ type, cbor });
    } catch (e: any) {
      setError(e.message);
    }
  }, [importAccounts, onNext]);
  return <Layout>
    <Header
      title="Scan the QR Code"
      onBack={onBack}
    />
    <Content>
      <Column justifyCenter itemsCenter gap='xxl'>
        <KeystoneLogoWithText width={160} />
        <Text text="Scan the QR code displayed on your Keystone device" />
        {!error && <>
          <KeystoneScan onSucceed={onSucceed} size={360} />
          <Text text="You need to allow camera access to use this feature." preset='sub' />
        </>}
      </Column>
    </Content>
    {error && <KeystonePopover
      msg={error}
      onClose={() => {
        onBack();
      }}
      onConfirm={() => {
        setError('');
      }}
    />}
  </Layout>;
}

function Step3({ onBack }: {
  contextData: ContextData;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const currentKeyring = useCurrentKeyring();
  const wallet = useWallet();
  const [addressType, setAddressType] = useState(AddressType.P2PKH);
  const addressTypes = useMemo(() => {
    return ADDRESS_TYPES.filter(item => item.displayIndex < 4);
  }, []);
  const [addresses, setAddresses] = useState<string[]>([]);
  const assets: AddressAssets = {
    total_btc: '',
    total_inscription: 0,
  }

  const onConfirm = useCallback(async () => {
    await wallet.changeAddressType(addressType);
    navigate('MainScreen');
  }, [addressType]);

  useEffect(() => {
    (async () => {
      const res = await wallet.getAllAddresses(currentKeyring, 0);
      setAddresses(res);
    })();
  }, [currentKeyring, wallet]);

  return <Layout>
    <Header
      onBack={onBack}
      title="Address Type"
    />
    <Content>
      <Column>
        {addressTypes.map((item, index) => {
          const address = addresses[item.value];
          const name = `${item.name} (${item.hdPath}/0)`;
          return (
            <AddressTypeCard
              key={index}
              label={name}
              address={address}
              assets={assets}
              checked={item.value == addressType}
              onClick={() => {
                setAddressType(item.value);
              }}
            />
          );
        })}
      </Column>
    </Content>
    <Footer>
      <Button preset='primary' onClick={onConfirm} text='Continue' />
    </Footer>
  </Layout>;
}

export default function CreateKeystoneWalletScreen() {
  const [contextData, setContextData] = useState<ContextData>({
    ur: {
      type: '',
      cbor: ''
    },
  })
  const [step, setStep] = useState(1);
  if (step === 1) {
    return <Step1 onNext={() => setStep(2)} />
  }
  if (step === 2) {
    return <Step2
      onBack={() => setStep(1)}
      onNext={({ type, cbor }) => {
        setStep(3);
        setContextData({
          ur: {
            type,
            cbor
          }
        });
      }}
    />
  }
  if (step === 3) {
    return <Step3
      contextData={contextData}
      onBack={() => setStep(2)}
    />
  }
  return <></>;
}
