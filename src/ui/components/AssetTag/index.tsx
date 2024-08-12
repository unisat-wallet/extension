import { Row } from '../Row';
import { Text } from '../Text';

export interface AssetTagProps {
  type: 'BRC20' | 'ARC20' | 'Inscription' | 'Unconfirmed' | 'RUNES';
  small?: boolean;
}

const colors = {
  BRC20: '#ABAE0B',
  ARC20: '#2B4E8B',
  Inscription: '#62A759',
  Unconfirmed: '#BC9238',
  RUNES: '#A14419'
};

export default function AssetTag(props: AssetTagProps) {
  const { type, small } = props;
  return (
    <Row style={{ backgroundColor: colors[type], borderRadius: small ? 4 : 5 }} px={small?'sm': 'md'} py={small?'zero': 'xs'} itemsCenter>
      <Text text={type} size={small ? 'xxs' : 'xs'} />
    </Row>
  );
}
