import { useEffect, useState } from 'react';

import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL, VERSION } from '@/shared/constant';
import { Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useDeveloperMode, useSetDeveloperModeCallback, useVersionInfo } from '@/ui/state/settings/hooks';
import { spacing } from '@/ui/theme/spacing';

export default function AboutUsScreen() {
  const versionInfo = useVersionInfo();
  const hasUpdate = versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVesion;
  const { t } = useI18n();
  const tools = useTools();
  const developerMode = useDeveloperMode();
  const setDeveloperMode = useSetDeveloperModeCallback();

  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  useEffect(() => {
    if (tapCount >= 10) {
      const newMode = !developerMode;
      setDeveloperMode(newMode);
      tools.toastSuccess(newMode ? t('developer_mode_enabled') : t('developer_mode_disabled'));
      setTapCount(0);
    }
  }, [tapCount, developerMode, setDeveloperMode, tools, t]);

  const handleVersionTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    if (timeDiff < 500) {
      setTapCount((prev) => prev + 1);
    } else {
      setTapCount(1);
    }

    setLastTapTime(now);
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('about_us')}
      />
      <Content style={{ padding: 2 }}>
        <Column gap="lg" style={{ padding: spacing.small }}>
          {/* Logo Section */}
          <Column itemsCenter style={{ marginTop: spacing.tiny }}>
            <Icon icon="aboutus" size={82} />
          </Column>

          {/* App Name */}
          <Column itemsCenter>
            <Text text="UniSat Wallet" preset="title-bold" size="xxl" />
          </Column>

          {/* Version Info */}
          <Column itemsCenter>
            <Text
              text={`${t('version')} ${VERSION}${developerMode ? ' (Dev)' : ''}`}
              preset="sub"
              color={developerMode ? 'gold' : 'textDim'}
              onClick={handleVersionTap}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            />
          </Column>

          {/* Update Status */}
          <Column itemsCenter>
            {hasUpdate ? (
              <Row
                style={{
                  borderRadius: 8,
                  border: '1px solid rgba(235, 185, 76, 0.6)',
                  cursor: 'pointer',
                  width: 173,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  gap: 0
                }}
                onClick={() => window.open('https://unisat.io/extension/update')}>
                <Icon icon="arrowUp" size={14} />
                <Text
                  text={t('new_update_available')}
                  style={{ marginLeft: 3, whiteSpace: 'nowrap', color: '#EBB94C' }}
                />
              </Row>
            ) : null}
          </Column>

          {/* Terms of Service & Privacy Policy */}
          <Column style={{ width: '100%', marginTop: spacing.large }}>
            <div
              style={{
                width: '328px',
                height: '104px',
                flexShrink: 0,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                margin: '0 auto'
              }}>
              <Row
                style={{
                  width: '100%',
                  padding: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  height: '52px'
                }}
                onClick={() => window.open(TERMS_OF_SERVICE_URL)}>
                <Row style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Text text={t('terms_of_service')} preset="regular" size="sm" style={{ color: 'white' }} />
                  <Icon icon="arrow-right" size={20} color="textDim" />
                </Row>
              </Row>
              <Row
                style={{
                  width: '100%',
                  padding: '16px',
                  cursor: 'pointer',
                  height: '52px'
                }}
                onClick={() => window.open(PRIVACY_POLICY_URL)}>
                <Row style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Text text={t('privacy_policy')} preset="regular" size="sm" style={{ color: 'white' }} />
                  <Icon icon="arrow-right" size={20} color="textDim" />
                </Row>
              </Row>
            </div>
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
