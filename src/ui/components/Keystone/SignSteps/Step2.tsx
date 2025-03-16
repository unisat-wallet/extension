import { useState } from 'react';

import { Column, Text } from '@/ui/components';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystoneScan from '@/ui/components/Keystone/Scan';

import { KeystoneSignBaseProps } from '../SignBase';
import { CONTENT_MAX_WIDTH } from './const';

export default function Step2({ parseUR, onSuccess }: KeystoneSignBaseProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onSucceed = async ({ type, cbor }) => {
    try {
      setIsProcessing(true);
      const res = await parseUR(type, cbor);
      if (onSuccess) {
        onSuccess(res);
      } else {
        throw new Error('onSuccess Not implemented');
      }
    } catch (error) {
      console.error('Error parsing signature:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text="Scan the QR code displayed on your Keystone device" preset="title" textCenter />
      <KeystoneScan onSucceed={onSucceed} size={250} />
      <Text
        text={
          isProcessing
            ? 'Processing signature...'
            : 'Position the QR code in front of your camera. The screen is blurred but this will not affect the scan.'
        }
        textCenter
        preset="sub"
      />
    </Column>
  );
}
