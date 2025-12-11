import { AlkanesBalanceCardProps, useAlkanesBalanceCardLogic } from '@unisat/wallet-state';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';
import { TokenBalanceIcon } from '../TokenBalanceIcon';
import { TokenBalancePrice } from '../TokenBalancePrice';

export default function AlkanesBalanceCard(props: AlkanesBalanceCardProps) {
  const { tokenBalance, onClick, showPrice, price, iconInfo, balance, balanceStr } = useAlkanesBalanceCardLogic(props);

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
          <Column onClick={onClick}>
            <TokenBalanceIcon iconInfo={iconInfo} />
          </Column>

          <Column justifyCenter style={{ marginRight: 'auto' }}>
            <Row itemsCenter justifyCenter>
              <RunesTicker tick={tokenBalance.name} />
              <Text
                text={tokenBalance.alkaneid}
                size="xs"
                color="white_muted"
                onClick={() => {
                  navigator.clipboard.writeText(tokenBalance.alkaneid);
                }}
              />
            </Row>
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
