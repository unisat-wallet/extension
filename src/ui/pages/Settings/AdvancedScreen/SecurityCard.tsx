import { useNavigate } from 'react-router-dom';

import { DEFAULT_LOCKTIME_ID, getAutoLockTimes } from '@/shared/constant';
import { Card, Column, Icon, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAutoLockTimeId } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';

export function SecurityCard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const autoLockTimeId = useAutoLockTimeId();
  const autoLockTimes = getAutoLockTimes();
  const lockTimeConfig = autoLockTimes[autoLockTimeId] || autoLockTimes[DEFAULT_LOCKTIME_ID];

  return (
    <Card style={{ borderRadius: 10 }}>
      <Column fullX>
        {/* Change Password Option */}
        <Row
          justifyBetween
          style={{
            cursor: 'pointer',
            marginBottom: 16
          }}
          onClick={() => navigate('/settings/password')}>
          <Text text={t('change_password')} size="sm" />
          <Icon icon="right" size={fontSizes.lg} color="textDim" />
        </Row>

        {/* Auto Lock Time Option */}
        <Row
          justifyBetween
          style={{
            cursor: 'pointer'
          }}
          onClick={() => navigate('/settings/lock-time')}>
          <Text text={t('automatic_lock_time')} size="sm" />

          <Row itemsCenter>
            <Text text={lockTimeConfig.label} color="gold" size="sm" />
            <Icon icon="right" size={fontSizes.lg} color="textDim" />
          </Row>
        </Row>
      </Column>
    </Card>
  );
}
