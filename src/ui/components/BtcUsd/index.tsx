import { Spin } from 'antd';
import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { Text } from '@/ui/components';
import { Sizes, TextProps } from '@/ui/components/Text';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useChain, useChainType } from '@/ui/state/settings/hooks';
import type { ColorTypes } from '@/ui/theme/colors';

export function BtcUsd(
  props: {
    sats: number;
    color?: ColorTypes;
    size?: Sizes;
    bracket?: boolean; // ()
  } & TextProps
) {
  const { sats, color = 'textDim', size = 'sm', bracket = false } = props;

  const { btcPrice, refreshBtcPrice, isLoadingBtcPrice } = usePrice();
  const chainType = useChainType();
  const chain = useChain();

  const [shown, setShown] = useState(false);
  const [showNoValue, setShowNoValue] = useState(false);

  useEffect(() => {
    setShown(chainType === ChainType.BITCOIN_MAINNET);
    setShowNoValue(chainType === ChainType.BITCOIN_TESTNET || chainType === ChainType.BITCOIN_SIGNET);
  }, [chainType]);

  useEffect(() => {
    refreshBtcPrice();
  }, []);

  const usd = useMemo(() => {
    if (isNaN(sats)) {
      return '-';
    }
    if (btcPrice <= 0) {
      return '-';
    }
    if (sats <= 0) {
      return '0.00';
    }
    const result = new BigNumber(sats).dividedBy(1e8).multipliedBy(btcPrice);

    if (result.isLessThan('0.01')) {
      return result.toPrecision(4);
    }

    return result.toFixed(2);
  }, [btcPrice, sats]);

  if (!chain.showPrice) {
    return <></>;
  }

  if (showNoValue) {
    if (bracket) {
      return <Text color={color} size={size} text={'($0.00)'} {...props} />;
    }
    return <Text color={color} size={size} text={'$0.00'} {...props} />;
  }

  if (!shown) {
    return <></>;
  }

  if (isNaN(sats)) {
    return <></>;
  }

  if (isLoadingBtcPrice) {
    return <Spin size={'small'} />;
  }

  if (bracket) {
    return <Text color={color} size={size} text={`($${usd})`} {...props} />;
  }
  return <Text color={color} size={size} text={`$${usd}`} {...props} />;
}
