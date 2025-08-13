import QRCode from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { Button, Card, Column, Icon, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { BBQREncoder } from '@unisat/animated-qr';

interface TransactionQRDisplayProps {
  psbtHex: string;
  onSuccess: () => void;
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

export default function TransactionQRDisplay({ psbtHex, onSuccess, onCancel, header }: TransactionQRDisplayProps) {
  const { t } = useI18n();
  const wallet = useWallet();
  const [qrData, setQrData] = useState<string>('');
  const [qrParts, setQrParts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMultiPart, setIsMultiPart] = useState<boolean>(false);
  const [requestId] = useState(() => Date.now().toString());

  // Generate signature request data
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

      const encoder = new BBQREncoder();
      const dataString = JSON.stringify(signRequest);

      try {
        const encodedParts = encoder.encode(dataString, 'transaction', {
          maxChunkSize: 400,
          compression: true
        });

        if (encodedParts.length > 1) {
          setQrParts(encodedParts);
          setIsMultiPart(true);
          setQrData('');
        } else {
          setQrData(encodedParts[0]);
          setIsMultiPart(false);
          setQrParts([]);
        }
      } catch (error) {
        console.error('BBQR encoding failed:', error);
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

  // Auto-rotate QR codes for multi-part
  useEffect(() => {
    if (isMultiPart && qrParts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % qrParts.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMultiPart, qrParts.length]);

  const currentQRData = isMultiPart ? qrParts[currentIndex] : qrData;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
        {header}

        <Column itemsCenter gap="lg" style={{ marginTop: 12 }}>
          <Text text={t('cold_wallet_transaction_signing')} preset="title" />
          <Text
            text={t('scan_this_qr_code_with_your_cold_wallet_to_review_and_sign_the_transaction')}
            style={{ textAlign: 'center' }}
            color="textDim"
          />

          <Card style={{ padding: 20, backgroundColor: 'white', borderRadius: 8, border: '4px solid #f4b62c' }}>
            <div
              style={{
                position: 'relative',
                width: '316px',
                height: '316px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
              {currentQRData ? (
                <>
                  <QRCode
                    value={currentQRData}
                    size={316}
                    level="L"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    style={{
                      borderRadius: '8px'
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                  }}>
                  <LoadingOutlined
                    style={{
                      fontSize: '32px',
                      color: colors.orange
                    }}
                  />
                  <Text text={t('generating_qr_code')} color="textDim" />
                </div>
              )}
            </div>
          </Card>

          <Card style={{ borderColor: '#4CAF50', borderWidth: 1 }}>
            <Column>
              <Row itemsCenter mb="md">
                <Icon icon="singer-info" style={{ width: '13px', height: '15px', marginRight: '12px' }} />
                <Text text={t('instructions')} color="green" size="sm" />
              </Row>
              <Text text={t('open_your_cold_wallet_app_or_device')} size="sm" mb="sm" />
              <Text text={t('scan_this_qr_code')} size="sm" mb="sm" />
              <Text text={t('review_and_confirm_transaction_details_in_your_cold_wallet')} size="sm" mb="sm" />
              <Text text={t('after_signing_scan_the_signed_qr_code_back_with_this_wallet')} size="sm" />
            </Column>
          </Card>
        </Column>
      </div>

      {/* Fixed Bottom Buttons */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Row gap="md" style={{ width: '100%' }}>
          <Button text={t('cancel')} preset="default" onClick={onCancel} style={{ flex: 1 }} />
          <Button text={t('i_have_signed_scan_result')} preset="primary" onClick={onSuccess} style={{ flex: 1 }} />
        </Row>
      </div>
    </div>
  );
}
