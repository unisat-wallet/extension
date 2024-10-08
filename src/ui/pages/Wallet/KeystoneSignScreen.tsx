import Base, { generateURString } from '@keystonehq/hw-app-base';
import { useEffect, useState } from 'react';

import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import { createKeystoneTransport } from '@/ui/components/Keystone/usb/utils';
import { $textPresets } from '@/ui/components/Text';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

interface Props {
  type: 'msg' | 'psbt' | 'bip322-simple';
  data: string;
  isFinalize?: boolean;
  signatureText?: string;
  id?: number;
  onSuccess?: (data: { psbtHex?: string; rawtx?: string; signature?: string }) => void;
  onBack: () => void;
}

function Step1(props: Props) {
  const wallet = useWallet();
  const [ur, setUr] = useState({
    type: '',
    cbor: ''
  });
  const tools = useTools();

  useEffect(() => {
    const p = props.type === 'psbt' ? wallet.genSignPsbtUr(props.data) : wallet.genSignMsgUr(props.data, props.type);
    p.then((ur) => {
      setUr(ur);
    }).catch((err) => {
      console.error(err);
      tools.toastError(err.message);
    });
  }, [props]);

  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: 306 }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text="Scan the QR code via your Keystone device" preset="title" textCenter />
      <KeystoneDisplay type={ur.type} cbor={ur.cbor} />
      <div style={{ ...$textPresets.sub, textAlign: 'center' }}>
        Click on the <span style={{ color: colors.primary }}>'Get Signature'</span> button after signing the transaction
        with your Keystone device.
      </div>
    </Column>
  );
}

function Step2(props: Props) {
  const wallet = useWallet();

  const onSucceed = async ({ type, cbor }) => {
    if (props.type === 'psbt') {
      const res = await wallet.parseSignPsbtUr(type, cbor, props.isFinalize === false ? false : true);
      if (props.onSuccess) {
        props.onSuccess(res);
      } else {
        throw new Error('onSuccess Not implemented');
      }
    } else {
      const res = await wallet.parseSignMsgUr(type, cbor, props.type);
      if (props.onSuccess) {
        props.onSuccess(res);
      } else {
        throw new Error('onSuccess Not implemented');
      }
    }
  };
  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: 306 }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text="Scan the QR code displayed on your Keystone device" preset="title" textCenter />
      <KeystoneScan onSucceed={onSucceed} size={250} />
      <Text
        text="Position the QR code in front of your camera. The screen is blurred but this will not affect the scan."
        textCenter
        preset="sub"
      />
    </Column>
  );
}


function USBStep(props: Props) {
  const wallet = useWallet();
  useEffect(() => {
    async function usbSign() {
      try {
        const p = props.type === 'psbt' ? wallet.genSignPsbtUr(props.data) : wallet.genSignMsgUr(props.data, props.type);
        const ur = await p;
        const transport = await createKeystoneTransport();
        const base = new Base(transport as any);
        console.log(ur)
        const urString = generateURString(ur.cbor, ur.type)
        console.log('-----------------', urString)
        const res = await base.sendURRequest(urString);
        const type = res.type;
        const cborhex = res.cbor.toString('hex');
        const result = props.type === 'psbt' ? await wallet.parseSignPsbtUr(type, cborhex, props.isFinalize === false ? false : true) : await wallet.parseSignMsgUr(type, cborhex, props.type);
        if (props.onSuccess) {
          props.onSuccess(result);
        } else {
          throw new Error('onSuccess Not implemented');
        }

      } catch (error) {
        console.error(error);
      }
    }
    usbSign();
  }, [props.id]);

  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: 306 }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text="Please sign in your keystone device" preset="title" textCenter />
    </Column>
  );

}

export default function KeystoneSignScreen(props: Props) {
  const [step, setStep] = useState(1);
  const [connectionType, setConnectionType] = useState<'USB' | 'QR' | undefined>(undefined);
  const wallet = useWallet();

  useEffect(() => {
    setStep(1);
    wallet.getKeystoneConnectionType().then((type) => {
      setConnectionType(type);
    });
  }, [props.id]);

  if (connectionType === 'QR') {
    return (
      <Layout>
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
        {step === 1 && (
          <Footer>
            <Row full>
              <Button preset="default" full text="Reject" onClick={props.onBack} />
              <Button preset="primary" full text={props.signatureText ?? 'Get Signature'} onClick={() => setStep(2)} />
            </Row>
          </Footer>
        )}
      </Layout>
    );
  } else if (connectionType === 'USB') {
    return (
      <Layout>
        <Header />
        <Content itemsCenter>
          <USBStep {...props} />
        </Content>
      </Layout>
    )
  } else {
    return <></>;
  }
}
