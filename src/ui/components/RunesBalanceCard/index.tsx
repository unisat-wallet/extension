import { RuneBalance, TickPriceItem } from '@/shared/types';

import { useRunesBalanceCardLogic } from '@unisat/wallet-state';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';
import { TokenBalanceIcon } from '../TokenBalanceIcon';
import { TokenBalancePrice } from '../TokenBalancePrice';

export interface RunesBalanceCardProps {
  tokenBalance: RuneBalance;
  onClick?: () => void;
  showPrice?: boolean;
  price?: TickPriceItem;
}

export default function RunesBalanceCard(props: RunesBalanceCardProps) {
  const { tokenBalance, onClick, showPrice, price, iconInfo, balance, balanceStr } = useRunesBalanceCardLogic(props);

  return (
    <Card
      style={{
        backgroundColor: '#1E1F24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
      }}
      fullX
      onClick={onClick}>
      <Column full py="zero" gap="zero">
        <Row fullY justifyBetween justifyCenter>
          <Column onClick={onClick}>
            <TokenBalanceIcon iconInfo={iconInfo} />
          </Column>

          <Column justifyCenter style={{ marginRight: 'auto' }}>
            <RunesTicker tick={tokenBalance.spacedRune} />
          </Column>

          <Row itemsCenter fullY gap="zero">
            <Text text={balanceStr} size="xs" />
            <Text text={tokenBalance.symbol} size="xs" mx="sm" />
          </Row>
        </Row>
        <TokenBalancePrice showPrice={showPrice} price={price} balance={balance.toString()} />
      </Column>
    </Card>
  );
}
