import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import { $textPresets } from '@/ui/components/Text';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { useApproval, useLocationState, useWallet } from '@/ui/utils';
import { useEffect, useState } from 'react';
import { useNavigate } from '../MainRoute';

interface Props {
  type: 'msg' | 'psbt';
  data: string;
  isApproval?: boolean;
}

function Step1(props: Props) {
  const wallet = useWallet();
  const [ur, setUr] = useState({
    type: '',
    cbor: '',
  });

  useEffect(() => {
    (async () => {
      console.log(props)
      const ur = props.type === 'psbt' ? await wallet.genSignPsbtUr(props.data) : await wallet.genSignMsgUr(props.data);
      console.log(ur)
      setUr(ur);
    })()
  }, [props])

  return <Column itemsCenter gap='xl' style={{ maxWidth: 306 }}>
    <KeystoneLogoWithText width={160} height={38} />
    <Text text="Scan the QR code displayed on your Keystone device" preset="title" textCenter />
    {ur.type && <KeystoneDisplay type={ur.type} cbor={ur.cbor} />}
    <div style={{ ...$textPresets.sub, textAlign: 'center' }}>
      Click on the <span style={{ color: colors.primary }}>'Get Signature'</span> button after signing the transaction with your Keystone device.
    </div>
  </Column>
}

function Step2(props: Props) {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const pushBitcointx = usePushBitcoinTxCallback();

  const onSucceed = async ({ type, cbor }) => {
    const res = props.type === 'psbt' ? await wallet.parseSignPsbtUr(type, cbor) : await wallet.parseSignMsgUr(type, cbor);
    if (props.isApproval) {
      resolveApproval();
    } else {
      const { txid, error, success } = await pushBitcointx((res as any).rawTxHex);
      if (success) {
        navigate('TxSuccessScreen', { txid });
      } else {
        navigate('TxFailScreen', { error });
      }
    }
  }
  return <Column itemsCenter gap='xl' style={{ maxWidth: 306 }}>
    <KeystoneLogoWithText width={160} height={38} />
    <Text text="Scan the QR code displayed on your Keystone device" preset="title" textCenter />
    <KeystoneScan onSucceed={onSucceed} size={250} />
    <Text text='Position the QR code in front of your camera. The screen is blurred but this will not affect the scan.' textCenter preset='sub' />
  </Column>
}

export default function KeystoneSignScreen() {
  const props = useLocationState<Props>();
  const [step, setStep] = useState(1);
  return <Layout>
    <Header
      onBack={() => {
        if (step === 1) {
          window.history.go(-1);
        } else {
          setStep(1);
        }
      }}
    />
    <Content itemsCenter>
      {step === 1 && <Step1 {...props} />}
      {step === 2 && <Step2 {...props} />}
    </Content>
    {step === 1 && <Footer>
      <Row full>
        <Button preset='default' full text='Reject' onClick={() => window.history.go(-1)} />
        <Button preset='primary' full text='Get Signature' onClick={() => setStep(2)} />
      </Row>
    </Footer>}
  </Layout>;
}
