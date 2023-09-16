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
  type: 'brc' | 'orc-20' | 'orc-cash';
  onClick?: () => void;
}

export default function BRC20BalanceCard(props: BRC20BalanceCardProps) {
  const {
    tokenBalance: { ticker, overallBalance, transferableBalance, availableBalance, tokenID },
    type,
    onClick
  } = props;
  return (
    <Card
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        width: '100%',
        height: 120,
        minWidth: '100%',
        minHeight: 120
      }}
      onClick={onClick}>
      <Column full>
        <Row justifyBetween itemsCenter>
          <Row itemsCenter>
            <Text text={ticker} color="gold" />
            {tokenID && <Text text={`ID #${tokenID}`} color="textDim" size="xxs" />}
          </Row>
          <Tooltip
            title="Cash can be sent directly with valid inscriptions or converted to Credit by sending to Burn Wallet. Credit can to be converted to Cash by inscribing valid Send inscriptions"
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
          <Text text={type === 'brc' ? 'Transferable:' : 'Cash:'} color="textDim" size="xs" />
          <Text text={transferableBalance} size="xs" />
        </Row>

        <Row justifyBetween>
          <Text text={type === 'brc' ? 'Available:' : 'Credit:'} color="textDim" size="xs" />
          <Text text={availableBalance} size="xs" />
        </Row>
        <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Row justifyBetween itemsCenter>
          <Text text="Balance:" color="textDim" size="xs" />
          <Text text={overallBalance} size="xs" />
        </Row>
      </Column>
    </Card>
  );
}
