import { useMemo } from 'react';

import { ChainType } from '@/shared/constant';
import { Row, Text } from '@/ui/components';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';

export function BtcDisplay({ balance }: { balance: string }) {
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const { intPart, decPart } = useMemo(() => {
    //   split balance into integer and decimal parts
    const [intPart, decPart] = balance.split('.');

    return {
      intPart,
      decPart: decPart || ''
    };
  }, [balance]);

  const isBTCChain =
    chainType === ChainType.BITCOIN_MAINNET ||
    chainType === ChainType.BITCOIN_TESTNET ||
    chainType === ChainType.BITCOIN_TESTNET4 ||
    chainType === ChainType.BITCOIN_SIGNET;

  if (chainType === 'FRACTAL_BITCOIN_MAINNET' || chainType === 'FRACTAL_BITCOIN_TESTNET') {
    //   show 3 decimal places for fractal bitcoin
    let decimalPlaces = 3;
    if (parseInt(balance) < 1) {
      decimalPlaces = 8;
    }
    return (
      <Row style={{ alignItems: 'flex-end' }} justifyCenter gap={'zero'} my="sm">
        <Text text={intPart} preset="title-bold" size="xxxl" color={isBTCChain ? 'white' : undefined} />
        {decPart && (
          <Text
            text={'.' + decPart.slice(0, decimalPlaces)}
            preset="title-bold"
            style={{
              color: isBTCChain ? '#FFFFFF' : '#8a8a8a',
              fontSize: 28
            }}
          />
        )}
        <Text
          text={btcUnit}
          preset="title-bold"
          size="xxxl"
          style={{ marginLeft: '0.25em' }}
          color={isBTCChain ? 'white' : undefined}
        />
      </Row>
    );
  }

  return (
    <Text
      text={balance + ' ' + btcUnit}
      preset="title-bold"
      textCenter
      size="xxxl"
      my="sm"
      color={isBTCChain ? 'white' : undefined}
    />
  );
}
