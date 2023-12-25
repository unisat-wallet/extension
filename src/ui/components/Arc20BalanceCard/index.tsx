import { Arc20Balance } from '@/shared/types';

import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface Arc2020BalanceCardProps {
  arc20Balance: Arc20Balance;
  onClick?: () => void;
}

export default function Arc20BalanceCard(props: Arc2020BalanceCardProps) {
  const {
    arc20Balance: { ticker, balance, confirmedBalance, unconfirmedBalance },
    onClick
  } = props;
  return (
    <Card
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        height: 120,
        minHeight: 120
      }}
      fullX
      onClick={onClick}>
      <Column full>
        <Row justifyBetween itemsCenter>
          <Text text={ticker} color="gold" />
        </Row>

        <Row justifyBetween>
          <Text text="Confirmed Balance:" color="textDim" size="xs" />
          <Text text={confirmedBalance} size="xs" />
        </Row>

        <Row justifyBetween>
          <Text text="Unconfirmed Balance:" color="textDim" size="xs" />
          <Text text={unconfirmedBalance} size="xs" />
        </Row>

        <Row justifyBetween>
          <Text text="Balance:" color="textDim" size="xs" />
          <Text text={balance} size="xs" />
        </Row>
      </Column>
    </Card>
  );
}
