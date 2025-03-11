import { useNavigate } from 'react-router-dom';

import { LOCALE_NAMES } from '@/shared/modules/i18n';
import { Card, Icon, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { fontSizes } from '@/ui/theme/font';

export function LanguageCard() {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const currentLanguageName = LOCALE_NAMES[locale];

  return (
    <Card style={{ borderRadius: 10, cursor: 'pointer' }} onClick={() => navigate('/settings/language')}>
      <Row full justifyBetween>
        <Text text={t('language')} preset="bold" size="sm" />
        <Row itemsCenter gap="xs">
          <Text text={currentLanguageName} size="sm" color="textDim" />
          <Icon icon="right" size={fontSizes.lg} color="textDim" />
        </Row>
      </Row>
    </Card>
  );
}
