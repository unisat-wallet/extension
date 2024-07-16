import { Text } from '@/ui/components';
import { useWallet } from '@/ui/utils';
import { useEffect, useMemo, useState } from 'react';
import { ChainType } from '@/shared/constant';
import { BigNumber } from 'bignumber.js';
import { Spin } from 'antd';
import { Sizes, TextProps } from '@/ui/components/Text';
import type { ColorTypes } from '@/ui/theme/colors';
import { useChainType } from '@/ui/state/settings/hooks';

export function BtcUsd(props: {
  sats: number;
  color?: ColorTypes;
  size?: Sizes;
  bracket?: boolean;  // ()
} & TextProps) {
  const { sats, color = 'textDim', size = 'sm', bracket = false } = props;

  const wallet = useWallet();
  const chainType = useChainType();

  const [shown, setShown] = useState(false);
  const [showNoValue, setShowNoValue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);


  useEffect(() => {
    setShown(chainType === ChainType.BITCOIN_MAINNET);
    setShowNoValue(chainType === ChainType.BITCOIN_TESTNET);
  }, [chainType]);

  useEffect(() => {
    if (!shown) {
      return;
    }
    setLoading(true);
    wallet.getBtcPrice().then((price) => {
      setPrice(price);
    }).catch(() => {
      setPrice(0);
    }).finally(() => {
      setLoading(false);
    });

  }, [shown]);

  const usd = useMemo(() => {
    if (price <= 0 || sats <= 0) {
      return '-';
    }
    return new BigNumber(sats).dividedBy(1e8).multipliedBy(price).toFixed(2);
  }, [price, sats]);

  if (showNoValue) {
    if (bracket) {
      return <Text color={color} size={size} text={'($0.00)'} {...props} />;
    }
    return <Text color={color} size={size} text={'$0.00'} {...props} />;
  }

  if (!shown) {
    return <></>;
  }

  if (!sats) {
    return <></>;
  }

  if (loading) {
    return <Spin />;
  }

  if (bracket) {
    return <Text color={color} size={size} text={`($${usd})`} {...props} />;
  }
  return <Text color={color} size={size} text={`$${usd}`} {...props} />;
}