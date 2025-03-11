import { useCallback, useEffect, useState } from 'react';

import { Column, Text } from '@/ui/components';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystonePopover from '@/ui/components/Keystone/Popover';
import { createKeystoneTransport, handleKeystoneUSBError } from '@/ui/components/Keystone/usb/utils';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { LoadingOutlined } from '@ant-design/icons';
import Base, { generateURString } from '@keystonehq/hw-app-base';

import { KeystoneSignBaseProps } from '../SignBase';
import { CONTENT_MAX_WIDTH } from './const';

export default function USBStep(props: KeystoneSignBaseProps) {
  const { generateUR, parseUR, onSuccess, onBack, id } = props;
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState('');
  const { t } = useI18n();

  const onCloseError = useCallback(() => {
    setIsError(false);
    setError('');
    onBack();
  }, [onBack]);

  const usbSign = useCallback(async () => {
    try {
      setLoading(true);
      const ur = await generateUR();
      const transport = await createKeystoneTransport();
      const base = new Base(transport as any);
      const urString = generateURString(ur.cbor, ur.type);
      const res = await base.sendURRequest(urString);
      const type = res.type;
      const cborhex = res.cbor.toString('hex');
      const result = await parseUR(type, cborhex);
      if (onSuccess) {
        onSuccess(result);
      } else {
        throw new Error(t('onsuccess_not_implemented'));
      }
    } catch (error) {
      setIsError(true);
      setError(handleKeystoneUSBError(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [generateUR, parseUR, onSuccess]);

  useEffect(() => {
    usbSign();
  }, [id, usbSign]);

  return (
    <Column itemsCenter gap="xl" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
      <KeystoneLogoWithText width={160} height={38} />
      <Text text={t('approve_on_your_keystone_device')} preset="title" textCenter />
      <Column style={{ minHeight: 240 }} itemsCenter justifyCenter>
        {loading && (
          <LoadingOutlined
            style={{
              fontSize: fontSizes.xxxl,
              color: colors.blue
            }}
          />
        )}
      </Column>
      {isError && <KeystonePopover msg={error} onClose={onCloseError} onConfirm={onCloseError} />}
      <Text text={t('ensure_your_keystone_3_pro_is_on_the_homepage')} textCenter preset="sub" />
    </Column>
  );
}
