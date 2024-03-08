import { useAnimatedQRScanner } from '@keystonehq/animated-qr';
import { Progress } from 'antd';
import { useState } from 'react';

export default function KeystoneScan({
  onSucceed,
}: {
  onSucceed: (data: { type: string, cbor: string }) => void
}) {
  const [progress, setProgress] = useState(0);
  const { AnimatedQRScanner, setIsDone } = useAnimatedQRScanner();
  const onError = (errorMessage) => {
    console.log('error: ', errorMessage);
    setIsDone(false);
  }
  const onProgress = (progress) => {
    setProgress(progress * 100);
  }
  return <div className="keystone-scan">
    <AnimatedQRScanner handleScan={onSucceed} handleError={onError} urTypes={['crypto-account', 'psbt', 'btc-signature']} onProgress={onProgress} />
    <Progress percent={progress} />
  </div>;
}
