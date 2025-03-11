import { useEffect, useState } from 'react';

import { Button, Content, Footer, Header, Layout, Row } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useWallet } from '@/ui/utils';

import { Step1, Step2, USBStep } from './SignSteps';
import { KeystoneConnectionType, KeystoneStep } from './SignSteps/const';

export interface KeystoneSignBaseProps {
  onBack: () => void;
  onSuccess?: (data: any) => void;
  signatureText?: string;
  id?: number | string;
  generateUR: () => Promise<{ type: string; cbor: string }>;
  parseUR: (type: string, cbor: string) => Promise<any>;
}

function QRModeContent({
  step,
  setStep,
  ...props
}: KeystoneSignBaseProps & { step: number; setStep: (step: number) => void }) {
  const { t } = useI18n();
  return (
    <Layout>
      <Header
        onBack={() => {
          if (step === KeystoneStep.INITIAL) {
            window.history.go(-1);
          } else {
            setStep(KeystoneStep.INITIAL);
          }
        }}
      />
      <Content itemsCenter>
        {step === KeystoneStep.INITIAL && <Step1 {...props} />}
        {step === KeystoneStep.SCAN && <Step2 {...props} />}
      </Content>
      {step === KeystoneStep.INITIAL && (
        <Footer>
          <Row full>
            <Button preset="default" full text={t('reject')} onClick={props.onBack} />
            <Button
              preset="primary"
              full
              text={props.signatureText ?? t('get_signature')}
              onClick={() => setStep(KeystoneStep.SCAN)}
            />
          </Row>
        </Footer>
      )}
    </Layout>
  );
}

function USBModeContent({ step, ...props }: KeystoneSignBaseProps & { step: number }) {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content itemsCenter>
        <USBStep {...props} />
      </Content>
    </Layout>
  );
}

export default function KeystoneSignBase(props: KeystoneSignBaseProps) {
  const [step, setStep] = useState(KeystoneStep.INITIAL);
  const [connectionType, setConnectionType] = useState<KeystoneConnectionType>(undefined);
  const wallet = useWallet();

  useEffect(() => {
    setStep(KeystoneStep.INITIAL);
    wallet.getKeystoneConnectionType().then((type) => {
      setConnectionType(type);
    });
  }, [props.id, wallet]);

  switch (connectionType) {
    case 'QR':
      return <QRModeContent {...props} step={step} setStep={setStep} />;
    case 'USB':
      return <USBModeContent {...props} step={step} />;
    default:
      return null;
  }
}
