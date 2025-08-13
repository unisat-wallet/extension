import { useCallback, useState } from 'react';

import { Button, Content, Header, Layout, Text } from '@/ui/components';
import { ColdWalletScan } from '@/ui/components/ColdWallet';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { ColdWalletData, MsgSignResult, TransactionSignResult } from '@unisat/animated-qr';
import { AddressType } from '@unisat/wallet-sdk';

import { QR_SCANNER_SIZE } from '../constants';
import { ContextData, Step2Props } from '../types';
import { validateAccountCount, validateHdPath, validateXpubPrefix } from '../utils';

export default function Step2({ onBack, onNext }: Step2Props) {
  const { t } = useI18n();
  const [validationError, setValidationError] = useState('');

  const validateQRData = useCallback(
    (data: ColdWalletData | TransactionSignResult | MsgSignResult | string): ContextData => {
      // Only process ColdWalletData, ignore other types
      if (typeof data === 'string' || 'txid' in data || 'signature' in data) {
        throw new Error('Invalid QR data type for cold wallet creation');
      }

      const coldWalletData = data as any;

      // Validate xpub data
      if (!coldWalletData.xpub) {
        throw new Error('No xpub found in QR data');
      }

      // Validate xpub format
      if (!validateXpubPrefix(coldWalletData.xpub)) {
        throw new Error('Invalid xpub format. Must start with xpub, tpub, ypub, or zpub');
      }

      // Validate address type
      if (coldWalletData.addressType === undefined || coldWalletData.addressType === null) {
        throw new Error('Address type is required but not specified in QR code data');
      }

      // Validate the validity of the address type
      const validAddressTypes = Object.values(AddressType).filter((v) => typeof v === 'number');
      if (!validAddressTypes.includes(coldWalletData.addressType)) {
        throw new Error(`Invalid address type: ${coldWalletData.addressType}. Must be a valid AddressType value`);
      }

      // Validate HD path format
      if (coldWalletData.hdPath && !validateHdPath(coldWalletData.hdPath)) {
        throw new Error(`Invalid HD path format: ${coldWalletData.hdPath}`);
      }

      // Validate account count
      if (coldWalletData.accountCount && !validateAccountCount(coldWalletData.accountCount)) {
        throw new Error('Account count must be between 1 and 20');
      }

      return coldWalletData as ContextData;
    },
    []
  );

  const onSucceed = useCallback(
    async (data: ColdWalletData | TransactionSignResult | MsgSignResult | string) => {
      try {
        setValidationError('');
        const validatedData = validateQRData(data);

        const version = validatedData.version || '1.1';
        console.log(`Cold wallet QR code version: ${version}`);

        if (onNext) {
          onNext(validatedData);
        }
      } catch (error) {
        console.error('Cold wallet data validation failed:', error);
        setValidationError((error as Error).message);
      }
    },
    [onNext, validateQRData]
  );

  return (
    <Layout style={{ backgroundColor: colors.background }}>
      <Header title={t('Scan Cold Wallet Public Key')} onBack={onBack} />
      <Content style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}>
          <Text
            text={t('Scan the QR code displayed by your cold wallet to import its watch-only public key.')}
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              lineHeight: '20px',
              maxWidth: '280px',
              marginBottom: '40px'
            }}
          />

          {/* Scanner area with corner frames */}
          <div
            style={{
              marginBottom: '40px',
              paddingLeft: '20px',
              paddingRight: '20px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
            <div style={{ position: 'relative' }}>
              <ColdWalletScan onSucceed={onSucceed} size={QR_SCANNER_SIZE} />

              {/* Corner frames overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none'
                }}>
                {/* Top-left corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '20px',
                    height: '20px',
                    borderTop: `3px solid ${colors.primary}`,
                    borderLeft: `3px solid ${colors.primary}`,
                    borderTopLeftRadius: '4px'
                  }}
                />
                {/* Top-right corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '20px',
                    height: '20px',
                    borderTop: `3px solid ${colors.primary}`,
                    borderRight: `3px solid ${colors.primary}`,
                    borderTopRightRadius: '4px'
                  }}
                />
                {/* Bottom-left corner */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '20px',
                    height: '20px',
                    borderBottom: `3px solid ${colors.primary}`,
                    borderLeft: `3px solid ${colors.primary}`,
                    borderBottomLeftRadius: '4px'
                  }}
                />
                {/* Bottom-right corner */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '20px',
                    height: '20px',
                    borderBottom: `3px solid ${colors.primary}`,
                    borderRight: `3px solid ${colors.primary}`,
                    borderBottomRightRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error handling */}
          {validationError && (
            <div
              style={{
                backgroundColor: colors.bg2,
                borderRadius: '12px',
                padding: '16px',
                width: '100%',
                maxWidth: '320px',
                border: `1px solid ${colors.red}`,
                textAlign: 'center',
                marginBottom: '20px'
              }}>
              <Text
                text={t('Scan Failed')}
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: colors.red,
                  marginBottom: '8px'
                }}
              />
              <Text
                text={validationError}
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '18px',
                  marginBottom: '12px'
                }}
              />
              <Button
                preset="default"
                onClick={() => setValidationError('')}
                style={{
                  backgroundColor: colors.bg3,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: colors.text
                }}>
                {t('Try Again')}
              </Button>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
