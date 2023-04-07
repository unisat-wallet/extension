import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20PreviewProps {
  tick: string;
  balance: string;
  inscriptionNumber: number;
  timestamp?: number;
  type?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function BRC20Preview({
  tick,
  balance,
  inscriptionNumber,
  timestamp,
  type,
  selected,
  onClick
}: BRC20PreviewProps) {
  if (!balance) {
    balance = 'deploy';
  }
  return (
    <Column
      style={{ backgroundColor: colors.bg4, width: 100, height: 130, minWidth: 100, minHeight: 130, borderRadius: 5 }}
      onClick={onClick}>
      <Column
        style={{
          padding: 8,
          height: 96,
          backgroundColor: type === 'TRANSFER' ? (selected ? 'green' : '#002514') : '#000',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        <Row>
          <Text text={tick} color="white_muted" size="lg" />
        </Row>

        <Text text={balance} size="xxl" textCenter />
      </Column>

      <Column px="sm" pb="sm" gap="sm">
        <Row justifyBetween>
          <Text text={`#${inscriptionNumber}`} color="primary" />
          {selected && <Icon icon="circle-check" color="green" style={{ marginRight: 5 }} />}
        </Row>
      </Column>
    </Column>
  );
}
