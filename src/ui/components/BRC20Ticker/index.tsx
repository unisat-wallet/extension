import { useMemo } from 'react';

import { Row } from '../Row';
import { Text } from '../Text';

// eslint-disable-next-line no-control-regex
const regex = /[\u0000-\u001F\u007F-\u009F\s]/;

const $tickerPresets: { sm: { textSize: any }; md: { textSize: any }; lg: { textSize: any } } = {
  sm: {
    textSize: 'xs'
  },
  md: {
    textSize: 'sm'
  },
  lg: {
    textSize: 'md'
  }
};

type Presets = keyof typeof $tickerPresets;

export function BRC20Ticker({ tick, preset }: { tick: string | undefined; preset?: Presets }) {
  const style = $tickerPresets[preset || 'md'];
  return useMemo(() => {
    if (!tick) return <></>;
    if (regex.test(tick)) {
      return (
        <Row gap="zero" itemsCenter>
          {tick.split('').map((char, index) => {
            if (regex.test(char)) {
              return <Text key={index} text={encodeURIComponent(char)} color="textDim" size={style.textSize} />;
            }
            return <Text key={index} text={char} size={style.textSize} color="gold" />;
          })}
        </Row>
      );
    }
    return <Text text={tick} size={style.textSize} color="gold" />;
  }, [tick]);
}
