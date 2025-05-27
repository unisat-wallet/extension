import { runesUtils } from '@/shared/lib/runes-utils';
import { TickPriceItem } from '@/shared/types';
import { TickUsd } from '@/ui/components/TickUsd';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface AlkaneBalance {
  alkaneid: string;
  name?: string;
  symbol?: string;
  amount: string;
  divisibility: number;
}

export interface AlkanesPreviewCardProps {
  balance: AlkaneBalance;
  onClick?: () => void;
  price?: TickPriceItem;
}

export default function AlkanesPreviewCard({ balance, onClick, price }: AlkanesPreviewCardProps) {
  const balanceStr = `${runesUtils.toDecimalAmount(balance.amount, balance.divisibility)} ${balance.symbol}`;

  let size = 'sm';
  if (balanceStr.length > 10) {
    size = 'xxs';
  } else if (balanceStr.length > 20) {
    size = 'xxxs';
  }

  return (
    <Column
      style={{
        position: 'relative',
        backgroundColor: '#2C3D4F',
        width: 80,
        height: 90,
        minWidth: 80,
        minHeight: 90,
        borderRadius: 5,
        padding: 0
      }}
      onClick={onClick}>
      <Row
        style={{
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          position: 'absolute'
        }}>
        <Row
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderBottomRightRadius: 5,
            borderTopLeftRadius: 5,
            width: 70
          }}
          px="sm">
          <Text text={`${balance.name} (${balance.alkaneid})`} wrap color="white" size="xxxs" />
        </Row>
      </Row>

      <Column fullY justifyCenter itemsCenter gap={'xs'}>
        <Text text={balanceStr} size={size as any} textCenter wrap />
        {price && balance.divisibility && (
          <TickUsd
            style={{ marginBottom: -16 }}
            price={price}
            balance={runesUtils.toDecimalAmount(balance.amount, balance.divisibility)}
          />
        )}
      </Column>
    </Column>
  );
}
