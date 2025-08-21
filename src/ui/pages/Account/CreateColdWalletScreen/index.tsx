import { useState } from 'react';

import { AddressType } from '@unisat/wallet-types';

import { Step1, Step2, Step3 } from './components';
import { ContextData } from './types';

export default function CreateColdWalletScreen() {
  const [contextData, setContextData] = useState<ContextData>({
    xpub: '',
    addressType: AddressType.P2WPKH,
    version: undefined,
    walletName: undefined,
    hdPath: undefined,
    accountCount: undefined
  });

  const [step, setStep] = useState(1);

  if (step === 1) {
    return <Step1 onNext={() => setStep(2)} />;
  }

  if (step === 2) {
    return (
      <Step2
        onBack={() => setStep(1)}
        onNext={(data: ContextData) => {
          setStep(3);
          setContextData({
            ...contextData,
            ...data
          });
        }}
      />
    );
  }

  if (step === 3) {
    return <Step3 contextData={contextData} onBack={() => setStep(2)} />;
  }

  return <></>;
}
