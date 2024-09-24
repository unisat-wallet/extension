import { Row, Text } from '@/ui/components';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';
import { useMemo } from 'react';

export function BtcDisplay({ balance }: {
  balance: string;
}) {
  const chainType = useChainType()
  const btcUnit = useBTCUnit();
  const {intPart,decPart} = useMemo(() => {
    //   split balance into integer and decimal parts
    const [intPart, decPart] = balance.split('.');

    return {
      intPart,
      decPart: decPart || ''
    };

  }, [balance]);

  if(chainType === 'FRACTAL_BITCOIN_MAINNET' || chainType === 'FRACTAL_BITCOIN_TESTNET'){
  //   show 3 decimal places for fractal bitcoin
    return <Row style={{alignItems:'flex-end'}} justifyCenter gap={'zero'}  my="sm">
      <Text text={intPart} preset="title-bold"  size="xxxl" />
      {
        decPart && <Text text={'.' + decPart.slice(0, 3)} preset="title-bold" style={{
          color:'#8a8a8a',
          fontSize:28
        }} />
      }
      <Text text={btcUnit} preset="title-bold" size="xxxl" style={{marginLeft:'0.25em'}}  />
    </Row>;
  }

  return <Text text={balance + ' ' + btcUnit} preset="title-bold" textCenter size="xxxl" my="sm" />;
}