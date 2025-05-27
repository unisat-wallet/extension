import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { TickPriceItem } from '@/shared/types';
import { Row, Text } from '@/ui/components';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { Sizes, TextProps } from '@/ui/components/Text';
import type { ColorTypes } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

function PriceChangePercent({ change, size }: { change: number; size?: Sizes }) {
  if (change === 0) {
    return <Text text={'0%'} color="textDim" size={size} />;
  }

  const changePercent = ((change || 0) * 100).toFixed(2);
  const color = change < 0 ? 'value_down_color' : 'value_up_color';

  return <Text text={`${changePercent}%`} color={color} size={size} />;
}

export function TickPriceChange(props: { price: TickPriceItem | undefined; color?: ColorTypes; size?: Sizes }) {
  const { price, color = 'textDim', size = 'xs' } = props;

  if (!price || price.curPrice === 0) {
    return (
      <Row>
        <Text text="--" color={color} size={size} />
        <Text text=" (--)" color={color} size={size} />
      </Row>
    );
  }

  return (
    <Row>
      <BtcUsd sats={price.curPrice} color={color} size={size} {...props} />
      <PriceChangePercent change={price.changePercent || 0} size={size} />
    </Row>
  );
}

export function TickUsd(
  props: {
    balance: string;
    price: TickPriceItem | undefined;
    color?: ColorTypes;
    size?: Sizes;
  } & TextProps
) {
  const { balance, price, color = 'textDim', size = 'xs' } = props;

  if (!price || price.curPrice === 0) {
    return <Text text="--" color={color} size={size} {...props} />;
  }

  const sats = useMemo(() => {
    return new BigNumber(balance).multipliedBy(price.curPrice).toNumber();
  }, [balance, price.curPrice]);

  return <BtcUsd sats={sats} color={color} size={size} {...props} />;
}

export enum TokenType {
  BRC20 = 'brc20',
  CAT20 = 'CAT20',
  RUNES = 'runes',
  ALKANES = 'alkanes'
}

export function TickUsdWithoutPrice(
  props: {
    tick: string;
    balance: string;
    type: TokenType;
    color?: ColorTypes;
    size?: Sizes;
  } & TextProps
) {
  const { tick, balance, type, color = 'textDim', size = 'xs' } = props;

  const wallet = useWallet();

  const [shown, setShown] = useState(false);
  const [price, setPrice] = useState<TickPriceItem | undefined>(undefined);

  useEffect(() => {
    setShown(false);

    if (tick) {
      if (type === TokenType.BRC20) {
        wallet
          .getBrc20sPrice([tick])
          .then((priceMap) => {
            setPrice(priceMap[tick]);
            if (priceMap[tick].curPrice > 0) {
              setShown(true);
            }
          })
          .catch(() => {
            setShown(false);
          });
      } else if (type === TokenType.RUNES) {
        wallet
          .getRunesPrice([tick])
          .then((priceMap) => {
            setPrice(priceMap[tick]);
            if (priceMap[tick].curPrice > 0) {
              setShown(true);
            }
          })
          .catch(() => {
            setShown(false);
          });
      } else if (type === TokenType.CAT20) {
        wallet
          .getCAT20sPrice([tick])
          .then((priceMap) => {
            setPrice(priceMap[tick]);
            if (priceMap[tick].curPrice > 0) {
              setShown(true);
            }
          })
          .catch(() => {
            setShown(false);
          });
      } else if (type === TokenType.ALKANES) {
        wallet
          .getAlkanesPrice([tick])
          .then((priceMap) => {
            setPrice(priceMap[tick]);
            if (priceMap[tick].curPrice > 0) {
              setShown(true);
            }
          })
          .catch(() => {
            setShown(false);
          });
      }
    }
  }, [tick]);

  const sats = useMemo(() => {
    if (!price) return 0;

    return new BigNumber(balance).multipliedBy(price.curPrice).toNumber();
  }, [price, balance]);

  // if api call is failed, don't show anything
  if (!shown) return <></>;

  return <BtcUsd sats={sats} color={color} size={size} {...props} />;
}
