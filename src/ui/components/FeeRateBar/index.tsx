import { CSSProperties } from 'react';

import { colors } from '@/ui/theme/colors';
import { useFeeRateBarLogic, useI18n, useNavigation } from '@unisat/wallet-state';

import { LOW_FEE_GUIDE_URL } from '@unisat/wallet-shared';
import { Column } from '../Column';
import { Input } from '../Input';
import { LowFeeModePopover } from '../LowFeeModePopover';
import { Row } from '../Row';
import { Text } from '../Text';

export function FeeRateBar({ readonly }: { readonly?: boolean }) {
  const {
    feeOptions,
    feeOptionIndex,
    setFeeOptionIndex,
    isSpecialLocale,
    isCustomOption,
    fontSize,
    feeRateInputVal,
    adjustFeeRateInput,
    toggleLowFeeRate,
    showCustomInput,
    toggleCustomInput,
    supportLowFeeMode,
    isSub1FeeOptionOn,
    showLowFeeModeTipsPopover,
    setShowLowFeeModeTipsPopover
  } = useFeeRateBarLogic({
    readonly
  });

  const { t } = useI18n();
  const nav = useNavigation();

  return (
    <Column>
      <Row>
        <Text text={t('fee')} />
      </Row>

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
                if (index === feeOptionIndex && !isCustomOption(v)) {
                  toggleCustomInput(!showCustomInput);
                }
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
              <Text
                text={v.title}
                textCenter
                style={{
                  color: selected ? colors.black : colors.white,
                  fontSize: isSpecialLocale ? (isCustomOption(v) ? '7px' : '12px') : '14px'
                }}
              />
              {!isCustomOption(v) && (
                <Text
                  text={`${v.feeRate} sat/vB`}
                  size={fontSize as any}
                  textCenter
                  style={{ color: selected ? colors.black : colors.white }}
                />
              )}
              {!isCustomOption(v) && (
                <Text
                  text={`${v.desc}`}
                  size={fontSize as any}
                  textCenter
                  style={{ color: selected ? colors.black : colors.white_muted }}
                />
              )}
            </div>
          );
        })}
      </Row>

      {isSub1FeeOptionOn ? (
        <Row itemsCenter>
          <Row
            itemsCenter
            onClick={() => {
              nav.navToUrl(LOW_FEE_GUIDE_URL);
            }}>
            <Text text={t('view_low_fee_mode_guide') + ' >'} color="gold" preset="link" />
          </Row>
        </Row>
      ) : null}
      {showCustomInput && (
        <Input
          preset="amount"
          placeholder={'sat/vB'}
          value={feeRateInputVal}
          runesDecimal={2}
          onAmountInputChange={(amount) => {
            adjustFeeRateInput(amount);
          }}
          autoFocus={true}
          enableStepper={true}
          step={0.01}
          min={supportLowFeeMode ? 0.1 : 1}
        />
      )}

      {showLowFeeModeTipsPopover && (
        <LowFeeModePopover
          onConfirm={() => {
            setShowLowFeeModeTipsPopover(false);
            toggleLowFeeRate();
          }}
          onClose={() => setShowLowFeeModeTipsPopover(false)}
        />
      )}
    </Column>
  );
}
