import { CSSProperties, useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { useI18n } from '@/ui/hooks/useI18n';
import { useChainType } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';
import { FeeRateType, MAX_FEE_RATE, translationKeys } from './const';

export function FeeRateBar({ readonly, onChange }: { readonly?: boolean; onChange?: (val: number) => void }) {
  const wallet = useWallet();
  const [feeOptions, setFeeOptions] = useState<{ title: string; desc?: string; feeRate: number }[]>([]);
  const { t } = useI18n();
  const chainType = useChainType();
  const isFractal = chainType === ChainType.FRACTAL_BITCOIN_MAINNET || chainType === ChainType.FRACTAL_BITCOIN_TESTNET;

  useEffect(() => {
    wallet.getFeeSummary().then((v) => {
      // Fee rate display rules:
      // if (Fast = Avg = Slow) -> show Fast time (30s) for all
      // if (Fast = Avg) -> show Fast time (30s) for both
      // if (Avg = Slow) -> show Avg time (1.5m) for both
      const { FAST, AVG, SLOW } = FeeRateType;
      const fastRate = v.list[FAST].feeRate;
      const avgRate = v.list[AVG].feeRate;
      const slowRate = v.list[SLOW].feeRate;

      const translatedList = v.list.map((option, index) => {
        const keys = translationKeys[index];
        if (keys) {
          let desc = t(keys.desc);

          if (isFractal) {
            if (fastRate === avgRate) {
              if (index === FAST || index === AVG) {
                desc = t('about_30_seconds_fb');
              } else if (index === SLOW && avgRate === slowRate) {
                desc = t('about_30_seconds_fb');
              } else {
                desc = t('about_3_minutes_fb');
              }
            } else if (avgRate === slowRate && (index === AVG || index === SLOW)) {
              desc = t('about_1_5_minutes_fb');
            } else {
              if (index === FAST) {
                desc = t('about_30_seconds_fb');
              } else if (index === AVG) {
                desc = t('about_1_5_minutes_fb');
              } else if (index === SLOW) {
                desc = t('about_3_minutes_fb');
              }
            }
          } else {
            if (fastRate === slowRate) {
              desc = t('about_10_minutes');
            }
          }

          return {
            ...option,
            title: t(keys.title),
            desc: desc
          };
        }
        return option;
      });

      if (readonly) {
        setFeeOptions(translatedList);
      } else {
        setFeeOptions([...translatedList, { title: t('custom'), feeRate: 0 }]);
      }
    });
  }, []);

  const [feeOptionIndex, setFeeOptionIndex] = useState(FeeRateType.AVG);
  const [feeRateInputVal, setFeeRateInputVal] = useState('');

  useEffect(() => {
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;

    let val = defaultVal;
    if (feeOptionIndex === FeeRateType.CUSTOM) {
      val = parseFloat(feeRateInputVal) || 0;
    } else if (feeOptions.length > 0) {
      val = feeOptions[feeOptionIndex].feeRate;
    }
    onChange && onChange(val);
  }, [feeOptions, feeOptionIndex, feeRateInputVal]);

  const adjustFeeRateInput = (inputVal: string) => {
    const val = parseFloat(inputVal);
    if (!val) {
      setFeeRateInputVal('');
      return;
    }
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;
    if (val <= 0) {
      setFeeRateInputVal(defaultVal.toString());
    } else if (val > MAX_FEE_RATE) {
      setFeeRateInputVal(MAX_FEE_RATE.toString());
    } else {
      setFeeRateInputVal(inputVal);
    }
  };

  const isCustomOption = (title: string) => title === t('custom');

  return (
    <Column>
      <Row justifyCenter>
        {feeOptions.map((v, index) => {
          let selected = index === feeOptionIndex;
          if (readonly) {
            selected = false;
          }

          return (
            <div
              key={v.title}
              onClick={() => {
                if (readonly) {
                  return;
                }
                setFeeOptionIndex(index);
              }}
              style={Object.assign(
                {},
                {
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  height: 75,
                  width: 75,
                  textAlign: 'center',
                  padding: 4,
                  borderRadius: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer'
                } as CSSProperties,
                selected ? { backgroundColor: colors.primary } : {}
              )}>
              <Text text={v.title} textCenter style={{ color: selected ? colors.black : colors.white }} />
              {!isCustomOption(v.title) && (
                <Text
                  text={`${v.feeRate} sat/vB`}
                  size="xxs"
                  textCenter
                  style={{ color: selected ? colors.black : colors.white }}
                />
              )}
              {!isCustomOption(v.title) && (
                <Text
                  text={`${v.desc}`}
                  size="xxs"
                  textCenter
                  style={{ color: selected ? colors.black : colors.white_muted }}
                />
              )}
            </div>
          );
        })}
      </Row>
      {feeOptionIndex === FeeRateType.CUSTOM && (
        <Input
          preset="amount"
          placeholder={'sat/vB'}
          value={feeRateInputVal}
          runesDecimal={1}
          onAmountInputChange={(amount) => {
            adjustFeeRateInput(amount);
          }}
          // onBlur={() => {
          //   const val = parseInt(feeRateInputVal) + '';
          //   setFeeRateInputVal(val);
          // }}
          autoFocus={true}
        />
      )}
    </Column>
  );
}
