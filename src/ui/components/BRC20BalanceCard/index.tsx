import { Tooltip } from 'antd';

import { TokenBalance } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { InfoCircleOutlined } from '@ant-design/icons';

import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20BalanceCardProps {
  tokenBalance: TokenBalance;
  onClick?: () => void;
}

export default function BRC20BalanceCard(props: BRC20BalanceCardProps) {
  const {
    tokenBalance: { ticker, overallBalance, transferableBalance, availableBalance },
    onClick
  } = props;
  return (
    <Card
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        width: 150,
        height: 120,
        minWidth: 150,
        minHeight: 120
      }}
      onClick={onClick}>
      <Column full>
        <Row justifyBetween itemsCenter>
          <Text text={ticker} color="gold" />
          <Tooltip
            title="The transferable amount is the balance that has been inscribed into transfer inscriptions but has not yet been sent."
            overlayStyle={{
              fontSize: fontSizes.xs
            }}>
            <InfoCircleOutlined
              style={{
                fontSize: fontSizes.xs,
                color: colors.textDim
              }}
            />
          </Tooltip>
        </Row>

        <Row justifyBetween>
          <Text text="Transferable:" color="textDim" size="xs" />
          <Text text={transferableBalance} size="xs" />
        </Row>

        <Row justifyBetween>
          <Text text="Available:" color="textDim" size="xs" />
          <Text text={availableBalance} size="xs" />
        </Row>
        <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Row justifyBetween itemsCenter>
          <Text text="Balance:" color="textDim" size="xs" />
          <Text text={overallBalance} size="lg" />
        </Row>
      </Column>
    </Card>
  );
}
