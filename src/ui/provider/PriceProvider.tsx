import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useWallet } from '@/ui/utils';

interface PriceContextType {
    isLoadingBtcPrice: boolean;
    btcPrice: number;
    refreshBtcPrice: () => void;
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

let isRequestingBtcPrice = false;
let refreshBtcPriceTime = 0;

export function PriceProvider({ children }: { children: ReactNode }) {
    const wallet = useWallet();
    const [isLoadingBtcPrice, setIsLoadingBtcPrice] = useState(false);
    const [btcPrice, setBtcPrice] = useState(0);

    const refreshBtcPrice = useCallback(() => {
        if (isRequestingBtcPrice) {
            return;
        }
        // 30s cache
        if (Date.now() - refreshBtcPriceTime < 30 * 1000) {
            return;
        }
        isRequestingBtcPrice = true;
        setIsLoadingBtcPrice(true);
        refreshBtcPriceTime = Date.now();
        wallet
            .getBtcPrice()
            .then(setBtcPrice)
            .catch((e) => {
                setBtcPrice(0);
            })
            .finally(() => {
                setIsLoadingBtcPrice(false);
                isRequestingBtcPrice = false;
            });
    }, []);

    useEffect(() => {
        refreshBtcPrice();
    }, [refreshBtcPrice]);

    const value = {
        isLoadingBtcPrice,
        btcPrice,
        refreshBtcPrice
    };

    return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
}
