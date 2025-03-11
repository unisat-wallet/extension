import { useState } from 'react';

import { Column, Text } from '@/ui/components';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import { useI18n } from '@/ui/hooks/useI18n';

import { KeystoneSignBaseProps } from '../SignBase';
import { CONTENT_MAX_WIDTH } from './const';

export default function Step2({ parseUR, onSuccess }: KeystoneSignBaseProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useI18n();

  const onSucceed = async ({ type, cbor }) => {
    try {
      setIsProcessing(true);
      const res = await parseUR(type, cbor);
      if (onSuccess) {
        onSuccess(res);
      } else {
        throw new Error(t('onsuccess_not_implemented'));
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
      <Text text={t('scan_the_qr_code_displayed_on_your_keystone_device')} preset="title" textCenter />
      <KeystoneScan onSucceed={onSucceed} size={250} />
      <Text
        text={
          isProcessing
            ? t('processing_signature')
            : t('position_the_qr_code_in_front_of_your_camera_the_screen_is_blurred_but_this_will_not_affect_the_scan')
        }
        textCenter
        preset="sub"
      />
    </Column>
  );
}
