import { colors } from '@/ui/theme/colors';

import { BRC20Ticker } from '../BRC20Ticker';
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
  preset?: 'small' | 'medium' | 'large';
}

export default function BRC20Preview({
  tick,
  balance,
  inscriptionNumber,
  timestamp,
  type,
  selected,
  onClick,
  preset
}: BRC20PreviewProps) {
  if (!balance) {
    balance = 'deploy';
  }
  let balanceSize = 'xxl';
  if (balance.length < 7) {
    balanceSize = 'xxl';
  } else if (balance.length < 14) {
    balanceSize = 'xl';
  } else if (balance.length < 21) {
    balanceSize = 'md';
  } else {
    balanceSize = 'sm';
  }

  let width = 100;
  let height = 130;
  let bodyHeight = 90;
  let numberSize: any = 'sm';
  let tickerPreset: any = 'md';
  if (preset === 'small') {
    width = 80;
    height = 90;
    bodyHeight = 60;
    numberSize = 'xs';
    balanceSize = 'sm';
    tickerPreset = 'sm';
  }
  return (
    <Column
      style={{ backgroundColor: colors.bg4, width, height, minWidth: width, minHeight: height, borderRadius: 5 }}
      onClick={onClick}>
      <Column
        style={{
          padding: 8,
          height: bodyHeight,
          backgroundColor: type === 'TRANSFER' ? (selected ? 'green' : '#002514') : '#000',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        <Row>
          <BRC20Ticker tick={tick} preset={tickerPreset} />
        </Row>

        <Text text={balance} size={balanceSize as any} textCenter wrap />
      </Column>

      <Column px="sm" pb="sm" gap="sm">
        <Row justifyBetween itemsCenter>
          <Text text={`#${inscriptionNumber}`} color="primary" size={numberSize} />
          {selected && <Icon icon="circle-check" color="green" style={{ marginRight: 5 }} />}
        </Row>
      </Column>
    </Column>
  );
}
