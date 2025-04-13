import { useEffect, useState } from 'react';

import { Column, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import { $textPresets } from '@/ui/components/Text';
import { colors } from '@/ui/theme/colors';

import { KeystoneSignBaseProps } from '../SignBase';
import { CONTENT_MAX_WIDTH } from './const';

export default function Step1({ generateUR, signatureText }: KeystoneSignBaseProps) {
  const [ur, setUr] = useState({
    type: '',
    cbor: ''
  });
  const [loading, setLoading] = useState(false);
  const tools = useTools();

  useEffect(() => {
    setLoading(true);
    generateUR()
      .then((ur) => {
        setUr(ur);
      })
      .catch((err) => {
        console.error(err);
        tools.toastError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [generateUR, tools]);

  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text="Scan the QR code via your Keystone device" preset="title" textCenter />
      {loading ? (
        <Text text="Generating QR code..." preset="sub" textCenter />
      ) : (
        <KeystoneDisplay type={ur.type} cbor={ur.cbor} />
      )}
      <div style={{ ...$textPresets.sub, textAlign: 'center' }}>
        Click on the <span style={{ color: colors.primary }}>{signatureText ?? 'Get Signature'}</span> button after
        signing the transaction with your Keystone device.
      </div>
    </Column>
  );
}
