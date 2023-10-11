import { Tooltip } from 'antd';

// import { TokenBalance } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { InfoCircleOutlined } from '@ant-design/icons';

import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { IAtomicalBalanceItem } from '@/background/service/interfaces/api';
import { findValueInDeepObject } from '@/ui/utils';
import { Image } from '../Image';

export interface ARC20BalanceCardProps {
  tokenBalance: IAtomicalBalanceItem;
  onClick?: () => void;
}

export default function ARC20BalanceCard(props: ARC20BalanceCardProps) {
  const {
    tokenBalance: { ticker, confirmed, data },
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
          <Row itemsCenter>
            <Image
              size={16}
              src={`data:image/png;base64,${Buffer.from(
                findValueInDeepObject(data.mint_data?.fields, '$d'),
                'hex'
              ).toString('base64')}`}
            />
            <Text text={ticker} color="blue" />
          </Row>
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

        <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Row justifyBetween itemsCenter>
          <Text text="Balance:" color="textDim" size="xs" />
          <Text text={confirmed} size="xs" />
        </Row>
      </Column>
    </Card>
  );
}
