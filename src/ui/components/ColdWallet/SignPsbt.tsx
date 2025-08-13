import { useCallback, useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { Button, Column, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useWallet } from '@/ui/utils';
import { BBQREncoder } from '@unisat/animated-qr';

import ColdWalletScan from './Scan';
import TransactionQRDisplay from './TransactionQRDisplay';

interface ColdWalletSignPsbtProps {
  psbtHex: string;
  onSuccess: (signedPsbtHex: string) => void;
  onCancel: () => void;
  header?: React.ReactNode;
}

interface SignRequest {
  psbtHex: string;
  timestamp: number;
  requestId: string;
  addresses: string[];
  decodedPsbt?: any;
  networkType?: number;
  chainType?: ChainType;
  expectedSignerPubkey?: string;
}

interface SignResponse {
  requestId: string;
  signedPsbtHex: string;
  timestamp: number;
}

export default function ColdWalletSignPsbt({ psbtHex, onSuccess, onCancel, header }: ColdWalletSignPsbtProps) {
  const { t } = useI18n();
  const wallet = useWallet();
  const [step, setStep] = useState<'generate' | 'scan'>('generate');
  const [qrData, setQrData] = useState<string>('');
  const [qrParts, setQrParts] = useState<string[]>([]);
  const [isMultiPart, setIsMultiPart] = useState<boolean>(false);
  const [requestId] = useState(() => Date.now().toString());

  // Generate signature request data with decoded PSBT information
  const generateSignRequest = useCallback(async () => {
    try {
      const currentAccount = await wallet.getCurrentAccount();
      const addresses = [currentAccount.address];
      const expectedSignerPubkey = currentAccount.pubkey;

      const decodedPsbt = await wallet.decodePsbt(psbtHex, '');

      const networkType = await wallet.getNetworkType();
      const chainType = await wallet.getChainType();

      const signRequest: SignRequest = {
        psbtHex,
        timestamp: Date.now(),
        requestId,
        addresses,
        decodedPsbt,
        networkType,
        chainType,
        expectedSignerPubkey
      };

      // Use BBQREncoder for encoding and splitting
      const encoder = new BBQREncoder();
      const dataString = JSON.stringify(signRequest);

      console.log('Encoding sign request data:', dataString.length, 'chars');

      try {
        const encodedParts = encoder.encode(dataString, 'transaction', {
          maxChunkSize: 600,
          compression: true
        });

        if (encodedParts.length > 1) {
          console.log(`Split into ${encodedParts.length} parts using BBQR protocol`);
          setQrParts(encodedParts);
          setIsMultiPart(true);
          setQrData('');
        } else {
          console.log('Data fits in single QR code');
          setQrData(encodedParts[0]);
          setIsMultiPart(false);
          setQrParts([]);
        }
      } catch (error) {
        console.error('BBQR encoding failed, using single QR code:', error);
        setQrData(dataString);
        setIsMultiPart(false);
        setQrParts([]);
      }
    } catch (error) {
      console.error('Failed to generate sign request:', error);
    }
  }, [psbtHex, requestId, wallet]);

  useEffect(() => {
    generateSignRequest();
  }, [generateSignRequest]);

  // Handle scanned signature result
  const handleSignResult = useCallback(
    (data: SignResponse) => {
      if (data.signedPsbtHex) {
        console.log('Sign result received:', data.requestId);
        onSuccess(data.signedPsbtHex);
      } else {
        console.error('Invalid sign response:', data);
      }
    },
    [onSuccess]
  );

  if (step === 'generate') {
    return (
      <TransactionQRDisplay psbtHex={psbtHex} onSuccess={() => setStep('scan')} onCancel={onCancel} header={header} />
    );
  }

  if (step === 'scan') {
    return (
      <Column style={{ padding: 16 }}>
        {header}

        <Column itemsCenter gap="lg" style={{ marginTop: 32 }}>
          <Text text={t('Scan Signed Transaction')} preset="title" />
          <Text
            text={t('Scan the QR code displayed on your mobile device after signing')}
            style={{ textAlign: 'center' }}
            color="textDim"
          />

          <ColdWalletScan
            onSucceed={(data: any) => {
              try {
                console.log('SignPsbt received scan data:', data);

                // Handle different data types returned by UniversalDecoder
                if (data && typeof data === 'object') {
                  // Transaction signature result format
                  if (data.signedPsbtHex) {
                    handleSignResult({
                      requestId: data.requestId || data.timestamp?.toString() || Date.now().toString(),
                      signedPsbtHex: data.signedPsbtHex,
                      timestamp: data.timestamp || Date.now()
                    } as SignResponse);
                    return;
                  }
                }

                console.error('Invalid QR code data format:', data);
              } catch (error) {
                console.error('Failed to process sign result:', error);
              }
            }}
            size={300}
          />

          <Row gap="md" style={{ width: '100%' }}>
            <Button text={t('Back')} preset="default" onClick={() => setStep('generate')} style={{ flex: 1 }} />
            <Button text={t('Cancel')} preset="default" onClick={onCancel} style={{ flex: 1 }} />
          </Row>
        </Column>
      </Column>
    );
  }

  return null;
}
