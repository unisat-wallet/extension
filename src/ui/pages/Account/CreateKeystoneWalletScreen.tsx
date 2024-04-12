import { ADDRESS_TYPES } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard2 } from '@/ui/components/AddressTypeCard';
import KeystoneLogo from '@/ui/components/Keystone/Logo';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystonePopover from '@/ui/components/Keystone/Popover';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import KeystoneProductImg from '@/ui/components/Keystone/imgs/keystone-product.png';
import { useImportAccountsFromKeystoneCallback } from '@/ui/state/global/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { ScanOutlined } from '@ant-design/icons';
import { AddressType } from '@unisat/wallet-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from '../MainRoute';

interface ContextData {
  ur: {
    type: string
    cbor: string
  }
}

function Step1({ onNext }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    if (state && state.fromUnlock) {
      return navigate('WelcomeScreen');
    }
    window.history.go(-1);
  }, []);

  return <Layout>
    <Header
      title="Connect Keystone"
      onBack={window.history.length === 1 ? undefined : onBack}
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
            <a href='https://keyst.one/' target='_blank' rel='noreferrer'>Learn more about Keystone</a>
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
  const onSucceed = useCallback(async ({ type, cbor }) => {
    onNext({ type, cbor });
  }, [onNext]);
  return <Layout>
    <Header
      title="Scan the QR Code"
      onBack={onBack}
    />
    <Content>
      <Column justifyCenter itemsCenter gap='xxl'>
        <KeystoneLogoWithText width={160} />
        <Text text="Scan the QR code displayed on your Keystone device" />
        <KeystoneScan onSucceed={onSucceed} size={360} />
        <Text text="You need to allow camera access to use this feature." preset='sub' />
      </Column>
    </Content>
  </Layout>;
}

function Step3({ onBack, contextData }: {
  contextData: ContextData;
  onBack: () => void;
}) {
  const importAccounts = useImportAccountsFromKeystoneCallback();
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();
  const [addressType, setAddressType] = useState(AddressType.P2PKH);
  const addressTypes = useMemo(() => {
    return ADDRESS_TYPES.filter(item => item.displayIndex < 4);
  }, []);
  const [groups, setGroups] = useState<{ type: AddressType; address_arr: string[]; satoshis_arr: number[] }[]>([]);
  const [isScanned, setScanned] = useState(false);
  const [error, setError] = useState('');

  const onConfirm = useCallback(async () => {
    try {
      await importAccounts(contextData.ur.type, contextData.ur.cbor, addressType, 1);
    } catch (e) {
      setError((e as any).message);
      return;
    }
    navigate('MainScreen');
  }, [addressType]);

  useEffect(() => {
    scanVaultAddress(1);
  }, []);

  const scanVaultAddress = async (accountCount = 10) => {
    tools.showLoading(true);
    setGroups([]);
    try {
      let groups: { type: AddressType; address_arr: string[]; satoshis_arr: number[] }[] = [];
      for (let i = 0; i < addressTypes.length; i++) {
        const keyring = await wallet.createTmpKeyringWithKeystone(contextData.ur.type, contextData.ur.cbor, addressTypes[i].value, accountCount);
        groups.push({
          type: addressTypes[i].value,
          address_arr: keyring.accounts.map(item => item.address),
          satoshis_arr: keyring.accounts.map(() => 0),
        })
      }
      const res = await wallet.findGroupAssets(groups);
      res.forEach((item, index) => {
        if (item.address_arr.length === 0) {
          res[index].address_arr = groups[index].address_arr;
          res[index].satoshis_arr = groups[index].satoshis_arr;
        }
      })
      groups = res;
      setGroups(groups);
    } catch (e) {
      console.error(e);
    }
    tools.showLoading(false);
  }

  const getItems = (groups, addressType) => {
    if (!groups[addressType]) {
      return [];
    }
    const group = groups[addressType];
    const items = group.address_arr.map((v, index) => ({
      address: v,
      satoshis: group.satoshis_arr[index],
      path: `${addressTypes[addressType].hdPath}/${index}`
    }));
    const filtItems = items.filter((v) => v.satoshis > 0);
    if (filtItems.length === 0) {
      filtItems.push(items[0]);
    }
    return filtItems;
  };

  return <Layout>
    <Header
      onBack={onBack}
      title="Address Type"
    />
    <Content>
      {!isScanned && <Row justifyEnd>
        <Text
          text="Scan in more addresses..."
          preset="link"
          onClick={() => {
            setScanned(true);
            scanVaultAddress();
          }}
        />
      </Row>}
      <Column>
        {addressTypes.map((item, index) => {
          return (
            <AddressTypeCard2
              key={index}
              label={item.name}
              items={getItems(groups, item.value)}
              checked={item.value == addressType}
              onClick={() => {
                setAddressType(item.value);
              }}
            />
          );
        })}
      </Column>
    </Content>
    {error && <KeystonePopover
      msg={error}
      onClose={() => {
        setError('');
      }}
      onConfirm={() => {
        setError('');
        onBack();
      }}
    />}
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
