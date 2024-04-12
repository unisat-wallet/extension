import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneScan from '@/ui/components/Keystone/Scan';
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

  return <Column itemsCenter>
    <Text text="Sign with Keystone" preset="title" />
    <Text text="Scan the QR code displayed on your Keystone device" preset="sub" />
    {ur.type && <KeystoneDisplay type={ur.type} cbor={ur.cbor} />}
  </Column>
}

function Step2(props: Props) {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const onSucceed = async ({ type, cbor }) => {
    console.log(type, cbor)
    const res = await wallet.parseSignMsgUr(type, cbor);
    console.log(res);
    if (props.isApproval) {
      resolveApproval();
    } else {
      navigate('TxSuccessScreen')
    }
  }
  return <Column itemsCenter>
    <Text text="Sign with Keystone" preset="title" />
    <Text text="Scan the QR code displayed on your Keystone device" preset="sub" />
    <KeystoneScan onSucceed={onSucceed} />
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
    <Content>
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
