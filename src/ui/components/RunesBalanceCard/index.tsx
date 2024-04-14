import { runesUtils } from '@/shared/lib/runes-utils';
import { RuneBalance } from '@/shared/types';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface RunesBalanceCardProps {
  tokenBalance: RuneBalance;
  onClick?: () => void;
}

export default function RunesBalanceCard(props: RunesBalanceCardProps) {
  const { tokenBalance, onClick } = props;
  return (
    <Card
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }}
      fullX
      onClick={() => {
        onClick && onClick();
      }}>
      <Column full py="zero" gap="zero">
        <Row fullY justifyBetween justifyCenter>
          <Column fullY justifyCenter>
            <BRC20Ticker tick={tokenBalance.spacedRune} />
          </Column>

          <Row itemsCenter fullY gap="zero">
            <Text text={runesUtils.toDecimalAmount(tokenBalance.amount, tokenBalance.divisibility)} size="xs" />
            <Text text={tokenBalance.symbol} size="xs" mx="sm" />
          </Row>
        </Row>
      </Column>
    </Card>
  );
}
