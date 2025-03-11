import { runesUtils } from '@/shared/lib/runes-utils';
import { CAT20Balance, TickPriceItem } from '@/shared/types';
import { TickPriceChange, TickUsd } from '@/ui/components/TickUsd';

import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';

export interface CAT20BalanceCardProps {
  tokenBalance: CAT20Balance;
  onClick?: () => void;
  showPrice?: boolean;
  price?: TickPriceItem;
}

export function CAT20BalanceCard(props: CAT20BalanceCardProps) {
  const { tokenBalance, onClick, showPrice, price } = props;
  const balance = runesUtils.toDecimalNumber(tokenBalance.amount, tokenBalance.decimals);
  const str = balance.toString();

  return (
    <Card
      style={{
        backgroundColor: '#1E1F24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
      }}
      fullX
      onClick={() => {
        onClick && onClick();
      }}>
      <Column full py="zero" gap="zero">
        <Row fullY justifyBetween justifyCenter>
          <Column fullY justifyCenter>
            <RunesTicker tick={tokenBalance.name} />
          </Column>

          <Row itemsCenter fullY gap="zero">
            <Text text={str} size="xs" />
            <Text text={tokenBalance.symbol} size="xs" mx="sm" />
          </Row>
        </Row>
        {showPrice && (
          <Row justifyBetween mt={'xs'}>
            <TickPriceChange price={price} />
            <TickUsd price={price} balance={balance.toString()} />
          </Row>
        )}
      </Column>
    </Card>
  );
}
