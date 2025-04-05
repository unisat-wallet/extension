import { useNavigate } from 'react-router-dom';

import { Card, Icon, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

export function ChangePasswordCard() {
  const navigate = useNavigate();

  return (
    <Card style={{ borderRadius: 10, cursor: 'pointer' }} onClick={() => navigate('/settings/password')}>
      <Row full justifyBetween>
        <Text text={'Change Password'} preset="bold" size="sm" />
        <Icon icon="right" size={fontSizes.lg} color="textDim" />
      </Row>
    </Card>
  );
}
