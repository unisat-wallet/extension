import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { Button, Column, Content, Header, Layout, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { ScanOutlined } from '@ant-design/icons';

import { useNavigate } from '../../../MainRoute';
import { Step1Props } from '../types';

export default function Step1({ onNext }: Step1Props) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const onBack = useCallback(() => {
    if (state && state.fromUnlock) {
      return navigate('WelcomeScreen');
    }
    window.history.go(-1);
  }, [state, navigate]);

  return (
    <Layout style={{ backgroundColor: colors.background }}>
      <Header title={t('Create Cold Wallet')} onBack={window.history.length === 1 ? undefined : onBack} />
      <Content style={{ padding: '20px' }}>
        <Column justifyCenter itemsCenter style={{ minHeight: '400px' }}>
          {/* Main illustration */}
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: colors.bg2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: `2px solid ${colors.border2}`
            }}
          >
            <ScanOutlined
              style={{
                fontSize: '48px',
                color: colors.primary
              }}
            />
          </div>

          {/* Title and description */}
          <Text
            text={t('Connect Cold Wallet')}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
              marginBottom: '8px'
            }}
          />

          <Text
            text={t('Scan QR code from your mobile app to import public keys')}
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              lineHeight: '20px',
              maxWidth: '280px',
              marginBottom: '40px'
            }}
          />

          {/* Quick steps */}
          <div
            style={{
              backgroundColor: colors.bg2,
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              marginBottom: '32px',
              border: `1px solid ${colors.border2}`
            }}
          >
            <Text
              text={t('Quick Setup:')}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: '12px'
              }}
            />

            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '18px' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: colors.primary, fontWeight: 'bold' }}>1.</span> Open mobile cold wallet app
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: colors.primary, fontWeight: 'bold' }}>2.</span> Export public keys as QR
              </div>
              <div>
                <span style={{ color: colors.primary, fontWeight: 'bold' }}>3.</span> Scan with this extension
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            preset="primary"
            style={{
              backgroundColor: colors.primary,
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              onNext();
            }}
          >
            <ScanOutlined style={{ marginRight: '8px', fontSize: '18px', color: colors.black }} />
            <Text text={t('Scan QR Code')} style={{ color: colors.black, fontWeight: 'bold' }} />
          </Button>
        </Column>
      </Content>
    </Layout>
  );
}
