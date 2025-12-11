import { Row } from '../Row';
import { Text } from '../Text';
import { TickPriceChange, TickUsd } from '../TickUsd';

export function TokenBalancePrice({ showPrice, price, balance }: { showPrice: boolean; price: any; balance: string }) {
  if (!showPrice) {
    return null;
  }

  return (
    <Row justifyBetween mt={'xs'}>
      <Row>
        {price && price.curPrice > 0 ? (
          <TickPriceChange price={price} />
        ) : (
          <Text text="$- " color="textDim" size="xs" />
        )}
      </Row>
      <Row>
        {price && price.curPrice > 0 ? (
          <TickUsd price={price} balance={balance} />
        ) : (
          <Text text="$-" color="textDim" size="xs" />
        )}
      </Row>
    </Row>
  );
}
