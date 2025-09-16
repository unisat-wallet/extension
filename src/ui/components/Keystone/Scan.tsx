import { useCallback, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { CameraOutlined } from '@ant-design/icons';
import { useAnimatedQRScanner } from '@keystonehq/animated-qr';

import { Progress } from '../Progress';
import KeystonePopover from './Popover';

export default function KeystoneScan({
  onSucceed,
  size
}: {
  onSucceed: (data: { type: string; cbor: string }) => void;
  size?: number;
}) {
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const { AnimatedQRScanner, setIsDone, isDone } = useAnimatedQRScanner();
  const { t } = useI18n();

  const onError = useCallback((e: any) => {
    console.error(e);
    setIsError(true);
    setProgress(0);
  }, []);

  const onProgress = useCallback((progress) => {
    setProgress(progress);
  }, []);

  const onCloseError = useCallback(() => {
    setIsError(false);
    setIsDone(false);
  }, []);

  return (
    <div className="keystone-scan">
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          background: colors.bg4
        }}>
        <CameraOutlined
          style={{
            fontSize: 32,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -16,
            marginLeft: -16
          }}
        />
        {!isError && (
          <AnimatedQRScanner
            handleScan={onSucceed}
            handleError={onError}
            urTypes={['crypto-account', 'crypto-psbt', 'btc-signature', 'cosmos-signature']}
            onProgress={onProgress}
            options={{
              blur: false,
              width: size,
              height: size
            }}
          />
        )}
      </div>
      {progress > 0 && !isError && (
        <Progress percent={isDone ? 100 : progress} showInfo={false} size="small" strokeColor={colors.primary} />
      )}
      {isError && (
        <KeystonePopover
          msg={t('invalid_qr_code_please_ensure_you_have_selected_a_valid_qr_code_from_your_keystone_device')}
          onClose={onCloseError}
          onConfirm={onCloseError}
        />
      )}
    </div>
  );
}
