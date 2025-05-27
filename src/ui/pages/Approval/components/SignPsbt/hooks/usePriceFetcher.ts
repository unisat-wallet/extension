import { useEffect, useState } from 'react';

export const usePriceFetcher = (txInfo, wallet, tools) => {
  const [brc20PriceMap, setBrc20PriceMap] = useState();
  const [runesPriceMap, setRunesPriceMap] = useState();

  useEffect(() => {
    if (!txInfo?.decodedPsbt?.inputInfos) return;

    const runesMap = {};
    const brc20Map = {};

    // collect asset information
    txInfo.decodedPsbt.inputInfos.forEach((v) => {
      if (v.runes) {
        v.runes.forEach((w) => {
          runesMap[w.spacedRune] = true;
        });
      }

      if (v.inscriptions) {
        v.inscriptions.forEach((w) => {
          if (w.brc20) {
            brc20Map[w.brc20.tick] = true;
          }
        });
      }
    });

    // get asset price
    if (Object.keys(runesMap).length > 0) {
      wallet
        .getRunesPrice(Object.keys(runesMap))
        .then(setRunesPriceMap)
        .catch((e) => tools.toastError(e.message));
    }

    if (Object.keys(brc20Map).length > 0) {
      wallet
        .getBrc20sPrice(Object.keys(brc20Map))
        .then(setBrc20PriceMap)
        .catch((e) => tools.toastError(e.message));
    }
  }, [txInfo, wallet, tools]);

  return { brc20PriceMap, runesPriceMap };
};
