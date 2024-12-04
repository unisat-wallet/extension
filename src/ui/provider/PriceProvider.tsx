import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { CoinPrice } from '@/shared/types';
import { useWallet } from '@/ui/utils';

import { useChain, useChainType } from '../state/settings/hooks';

interface PriceContextType {
  isLoadingCoinPrice: boolean;
  coinPrice: CoinPrice;
  refreshCoinPrice: () => void;
}

const PriceContext = createContext<PriceContextType>({} as PriceContextType);

export function usePrice() {
  const context = useContext(PriceContext);
  if (!context) {
    throw Error('Feature flag hooks can only be used by children of BridgeProvider.');
  } else {
    return context;
  }
}

let isRequestingCoinPrice = false;
let refreshCoinPriceTime = 0;

export function PriceProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const chainType = useChainType();
  const chain = useChain();
  const [isLoadingCoinPrice, setIsLoadingCoinPrice] = useState(false);
  const [coinPrice, setCoinPrice] = useState<CoinPrice>({
    btc: 0,
    fb: 0
  });

  const refreshCoinPrice = useCallback(() => {
    if (chain.showPrice === false) {
      return;
    }
    if (isRequestingCoinPrice) {
      return;
    }
    // 30s cache
    if (Date.now() - refreshCoinPriceTime < 30 * 1000) {
      return;
    }
    isRequestingCoinPrice = true;
    setIsLoadingCoinPrice(true);
    refreshCoinPriceTime = Date.now();
    wallet
      .getCoinPrice()
      .then(setCoinPrice)
      .catch((e) => {
        setCoinPrice({
          btc: 0,
          fb: 0
        });
      })
      .finally(() => {
        setIsLoadingCoinPrice(false);
        isRequestingCoinPrice = false;
      });
  }, [chainType, chain]);

  useEffect(() => {
    refreshCoinPrice();
  }, [refreshCoinPrice]);

  const value = {
    isLoadingCoinPrice,
    coinPrice,
    refreshCoinPrice
  };

  return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
}
