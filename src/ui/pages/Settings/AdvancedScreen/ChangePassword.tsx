import { useNavigate } from 'react-router-dom';

import { Card, Icon, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';
import { useI18n } from '@unisat/wallet-state';

export function ChangePasswordCard() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Card style={{ borderRadius: 10, cursor: 'pointer' }} onClick={() => navigate('/settings/password')}>
      <Row full justifyBetween>
        <Text text={t('change_password')} preset="bold" size="sm" />
        <Icon icon="right" size={fontSizes.lg} color="textDim" />
      </Row>
    </Card>
  );
}
