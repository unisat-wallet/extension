import { useEffect, useState } from 'react';

import { Column, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import { $textPresets } from '@/ui/components/Text';
import { useI18n } from '@/ui/hooks/useI18n';
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
  const { t } = useI18n();

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
      <Text text={t('scan_the_qr_code_via_your_keystone_device')} preset="title" textCenter />
      {loading ? (
        <Text text={t('generating_qr_code')} preset="sub" textCenter />
      ) : (
        <KeystoneDisplay type={ur.type} cbor={ur.cbor} />
      )}
      <div style={{ ...$textPresets.sub, textAlign: 'center' }}>
        {t('click_on_the')} <span style={{ color: colors.primary }}>{signatureText ?? t('get_signature')}</span>{' '}
        {t('button_after_signing_the_transaction_with_your_keystone_device')}
      </div>
    </Column>
  );
}
