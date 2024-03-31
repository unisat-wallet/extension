import { colors } from '@/ui/theme/colors';

import { BRC20Ticker } from '../BRC20Ticker';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20PreviewProps {
  tick: string;
  balance?: string;
  inscriptionNumber: number;
  timestamp?: number;
  type?: string;
  selected?: boolean;
  selectable?: boolean;
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
    balance = 'Deploy';
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
  let numberSize: any = 'md';
  let tickerPreset: any = 'md';
  if (preset === 'small') {
    width = 80;
    height = 90;
    bodyHeight = 60;
    numberSize = 'xs';
    balanceSize = 'sm';
    tickerPreset = 'sm';
  }
  let bg: any = 'black';
  if (type === 'TRANSFER') {
    // if (selected) {
    //   bg = 'brc20_transfer_selected';
    // } else {
    bg = 'brc20_transfer';
    // }
  } else if (type === 'DEPLOY') {
    bg = 'brc20_deploy';
  }
  return (
    <Column
      style={{
        backgroundColor: colors.bg4,
        width,
        height,
        minWidth: width,
        minHeight: height,
        borderRadius: 5,
        borderWidth: selected ? 1 : 0,
        borderColor: colors.primary
      }}
      onClick={onClick}>
      <Column
        style={{
          padding: 8,
          height: bodyHeight,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}
        bg={bg}>
        <Row>
          <BRC20Ticker tick={tick} preset={tickerPreset} />
        </Row>

        <Text text={balance} size={balanceSize as any} textCenter wrap />
      </Column>

      <Column px="sm" pb="sm" gap="sm">
        <Row itemsCenter justifyCenter>
          <Text text={`#${inscriptionNumber}`} color="primary" size={numberSize} />
        </Row>
      </Column>
    </Column>
  );
}
