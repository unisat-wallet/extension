import { runesUtils } from '@/shared/lib/runes-utils';
import { RuneBalance } from '@/shared/types';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface RunesPreviewCardProps {
  balance: RuneBalance;
  onClick?: () => void;
}

export default function RunesPreviewCard({ balance, onClick }: RunesPreviewCardProps) {
  return (
    <Column
      style={{ position: 'relative', backgroundColor: '#936132', width: 80, height: 90, borderRadius: 5, padding: 5 }}
      onClick={onClick}>
      <Row
        style={{
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          position: 'absolute'
        }}>
        <Row
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderBottomRightRadius: 5, borderTopLeftRadius: 5 }}
          px="sm">
          <Text text={balance.spacedRune} wrap color="gold" size="xxxs" />
        </Row>
      </Row>

      <Column fullY justifyCenter>
        <Text
          text={`${runesUtils.toDecimalAmount(balance.amount, balance.divisibility)} ${balance.symbol}`}
          size="sm"
          textCenter
        />
      </Column>
    </Column>
  );
}
