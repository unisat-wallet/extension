import { useCallback, useState } from 'react';

import { LOCALE_NAMES, SUPPORTED_LOCALES } from '@/shared/modules/i18n';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

export default function LanguageScreen() {
  const { t, locale: currentLocale, changeLocale } = useI18n();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  const handleLanguageSelect = useCallback(
    async (locale: string) => {
      if (locale === currentLocale) return;
      setSelectedLocale(locale);
      try {
        localStorage.setItem('userSelectedLanguage', 'true');
        await changeLocale(locale);

        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'CHANGE_LANGUAGE', locale });
        }

        window.history.go(-1);
      } catch (error) {
        console.error('change locale error:', error);
      }
    },
    [changeLocale, currentLocale]
  );

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('language')}
      />
      <Content>
        <Column
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
            paddingBottom: 16
          }}>
          <Card
            style={{
              width: '328px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: 0
            }}>
            <div
              style={{
                width: '100%',
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
              <Column fullX>
                {SUPPORTED_LOCALES.map((locale, index) => (
                  <Column key={locale} fullX>
                    {index > 0 && <Row style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />}
                    <Row
                      onClick={() => handleLanguageSelect(locale)}
                      itemsCenter
                      justifyBetween
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        minHeight: '34px'
                      }}
                      full>
                      <Text
                        color={locale === selectedLocale ? 'white' : 'textDim'}
                        size="sm"
                        text={LOCALE_NAMES[locale]}
                      />
                      {locale === selectedLocale && <Icon icon="checked" color="gold" size={20} />}
                    </Row>
                  </Column>
                ))}
              </Column>
            </div>
          </Card>
        </Column>
      </Content>
    </Layout>
  );
}
