import { useChain } from '@/ui/state/settings/hooks';

import { Row } from '../Row';
import { Text } from '../Text';

export interface AssetTagProps {
  type: string;
  small?: boolean;
  fractal?: boolean;
}

const colors = {
  'self-issuance': 'orange',
  'bool-bridge': 'gray',
  'simple-bridge': 'gray'
};

export default function Tag(props: AssetTagProps) {
  const { type, small } = props;

  const chain = useChain();
  const isFractal = chain.isFractal;

  if (type === 'bool-bridge') {
    return (
      <Row style={{ padding: '2px 4px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' }}>
        <Text text={'Bool Bridge'} size={small ? 'xxs' : 'xs'} style={{ color: '#ddd' }} />
      </Row>
    );
  } else if (type === 'simple-bridge') {
    return (
      <Row style={{ padding: '2px 4px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' }}>
        <Text text={'Simple Bridge'} size={small ? 'xxs' : 'xs'} style={{ color: '#ddd' }} />
      </Row>
    );
  } else if (type === 'self-issuance' && !isFractal) {
    return (
      <Row
        style={{ borderColor: colors[type], borderWidth: 1, borderRadius: small ? 4 : 5 }}
        px={small ? 'sm' : 'md'}
        py={small ? 'zero' : 'xs'}
        itemsCenter>
        <Text text="5-byte" size={small ? 'xxs' : 'xs'} style={{ color: colors[type] }} />
      </Row>
    );
  }

  return (
    <Row
      style={{ borderColor: colors[type], borderWidth: 1, borderRadius: small ? 4 : 5 }}
      px={small ? 'sm' : 'md'}
      py={small ? 'zero' : 'xs'}
      itemsCenter>
      <Text text={type} size={small ? 'xxs' : 'xs'} style={{ color: colors[type] }} />
    </Row>
  );
}
