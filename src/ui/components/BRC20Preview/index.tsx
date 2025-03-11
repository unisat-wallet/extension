import { TickPriceItem } from '@/shared/types';
import { TickUsd, TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';

import { BRC20Ticker } from '../BRC20Ticker';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20PreviewProps {
  tick: string;
  balance?: string;
  inscriptionNumber: number;
  timestamp?: number;
  type?: string;
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  preset?: 'small' | 'medium' | 'large';
  confirmations?: number;
  price?: TickPriceItem;
  priceInProps?: boolean;
}

export default function BRC20Preview({
  tick,
  balance,
  inscriptionNumber,
  timestamp,
  type,
  selected,
  onClick,
  preset,
  confirmations,
  priceInProps,
  price
}: BRC20PreviewProps) {
  const { t } = useI18n();
  if (!balance) {
    balance = 'Deploy';
  }
  let balanceSize = 'xxl';
  if (balance.length < 7) {
    balanceSize = 'md';
  } else if (balance.length < 14) {
    balanceSize = 'md';
  } else if (balance.length < 21) {
    balanceSize = 'md';
  } else {
    balanceSize = 'sm';
  }

  let width = 100;
  let height = 130;
  let bodyHeight = 90;
  let numberSize: any = 'sm';
  let tickerPreset: any = 'md';
  if (preset === 'small') {
    width = 80;
    height = 90;
    bodyHeight = 60;
    numberSize = 'xs';
    balanceSize = 'sm';
    tickerPreset = 'sm';
  }
  let bg: any = 'black';
  if (type === 'TRANSFER') {
    // if (selected) {
    //   bg = 'brc20_transfer_selected';
    // } else {
    bg = 'brc20_transfer';
    // }
  } else if (type === 'DEPLOY') {
    bg = 'brc20_deploy';
  }
  return (
    <Column
      style={{
        backgroundColor: colors.bg4,
        // width,
        height,
        minWidth: width,
        minHeight: height,
        borderRadius: 5,
        borderWidth: selected ? 1 : 0,
        borderColor: colors.primary
      }}
      gap="zero"
      onClick={onClick}>
      <Row
        bg={bg}
        style={{
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        <Row
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderBottomRightRadius: 5, borderTopLeftRadius: 5 }}
          px="sm">
          <BRC20Ticker tick={tick} preset={tickerPreset} />
        </Row>
      </Row>
      <Column
        style={{
          height: bodyHeight
        }}
        justifyCenter
        itemsCenter
        gap={'xs'}
        bg={bg}>
        <Text text={balance} size={balanceSize as any} textCenter wrap digital />
        {type === 'TRANSFER' && priceInProps ? (
          <TickUsd price={price} balance={balance} />
        ) : (
          <TickUsdWithoutPrice tick={tick} balance={balance} type={TokenType.BRC20} />
        )}
      </Column>

      <Column px="sm" pb="sm" gap="sm" py="sm">
        <Row itemsCenter justifyCenter>
          <Text
            text={confirmations === 0 ? t('unconfirmed') : `#${inscriptionNumber}`}
            color="primary"
            size={numberSize}
          />
        </Row>
      </Column>
    </Column>
  );
}
