import { useI18n } from '@/ui/hooks/useI18n';

import { Row } from '../Row';
import { Text } from '../Text';

export interface AssetTagProps {
  type: 'BRC20' | 'ARC20' | 'Inscription' | 'Unconfirmed' | 'RUNES' | 'Alkanes';
  small?: boolean;
}

const colors = {
  BRC20: '#ABAE0B',
  ARC20: '#2B4E8B',
  Inscription: '#62A759',
  Unconfirmed: '#BC9238',
  RUNES: '#A14419',
  Alkanes: '#A14419'
};

export default function AssetTag(props: AssetTagProps) {
  const { type, small } = props;
  const { t } = useI18n();

  const displayText = () => {
    if (type === 'RUNES') {
      return t('runes');
    } else if (type === 'Unconfirmed') {
      return t('unconfirmed');
    } else if (type === 'Inscription') {
      return t('inscription');
    }
    return type;
  };

  return (
    <Row
      style={{ backgroundColor: colors[type], borderRadius: small ? 4 : 5 }}
      px={small ? 'sm' : 'md'}
      py={small ? 'zero' : 'xs'}
      itemsCenter>
      <Text text={displayText()} size={small ? 'xxs' : 'xs'} />
    </Row>
  );
}
