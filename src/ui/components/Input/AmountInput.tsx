import { useEffect, useState } from 'react';

import { Icon, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { useI18n } from '@unisat/wallet-state';

import { $baseContainerStyle, $baseInputStyle, InputProps } from '.';
import { Column } from '../Column';

export function AmountInput(props: InputProps) {
  const {
    placeholder,
    onAmountInputChange,
    disabled,
    style: $inputStyleOverride,
    disableDecimal,
    enableBrc20Decimal,
    containerStyle,
    runesDecimal,
    enableMax,
    onMaxClick,
    enableStepper,
    step = 0.01,
    min = 0.01,
    ...rest
  } = props;
  const $style = Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {});
  const { t } = useI18n();
  if (!onAmountInputChange) {
    return <div />;
  }
  const [inputValue, setInputValue] = useState(props.value || '');
  const [validAmount, setValidAmount] = useState(props.value || '');
  useEffect(() => {
    onAmountInputChange(validAmount);
  }, [validAmount]);

  const handleInputAmount = (e) => {
    const value = e.target.value;
    if (disableDecimal) {
      if (/^[1-9]\d*$/.test(value) || value === '') {
        setValidAmount(value);
        setInputValue(value);
      }
    } else {
      if (enableBrc20Decimal) {
        if (/^(0(\.\d{0,18})?|[1-9]\d*\.?\d{0,18})$/.test(value) || value === '') {
          setValidAmount(value);
          setInputValue(value);
        }
      } else if (runesDecimal !== undefined) {
        const regex = new RegExp(`^(0(\\.\\d{0,${runesDecimal}})?|[1-9]\\d*\\.?\\d{0,${runesDecimal}})$`);
        if (regex.test(value) || value === '') {
          setValidAmount(value);
          setInputValue(value);
        }
      } else {
        if (/^(0(\.\d{0,8})?|[1-9]\d*\.?\d{0,8})$/.test(value) || value === '') {
          setValidAmount(value);
          setInputValue(value);
        }
      }
    }
  };

  const handleStepUp = () => {
    const currentVal = parseFloat(props.value!) || 0;
    const decimal = runesDecimal !== undefined ? runesDecimal : 2;
    const newVal = (currentVal + step).toFixed(decimal);
    setValidAmount(newVal);
    setInputValue(newVal);
  };

  const handleStepDown = () => {
    const currentVal = parseFloat(props.value!) || 0;
    const decimal = runesDecimal !== undefined ? runesDecimal : 2;
    const newVal = Math.max(min, currentVal - step).toFixed(decimal);
    setValidAmount(newVal);
    setInputValue(newVal);
  };

  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input
        placeholder={placeholder || ''}
        type={'text'}
        value={inputValue}
        onChange={handleInputAmount}
        style={$style}
        disabled={disabled}
        {...rest}
      />
      {enableMax ? (
        <Text
          onClick={() => {
            if (onMaxClick) onMaxClick();
          }}
          text={t('max')}
          color={'yellow'}
          size="sm"
        />
      ) : null}
      {enableStepper && (
        <Column gap="zero" style={{ marginLeft: spacing.small }}>
          <Icon
            icon="up"
            size={12}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              padding: 2
            }}
            onClick={disabled ? undefined : handleStepUp}
          />
          <Icon
            icon="down"
            size={12}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              padding: 2
            }}
            onClick={disabled ? undefined : handleStepDown}
          />
        </Column>
      )}
    </div>
  );
}
