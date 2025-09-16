import React, { CSSProperties, createContext, useContext } from 'react';

import { Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';

interface RadioContextType {
  value?: any;
  onChange?: (value: any) => void;
}

const RadioContext = createContext<RadioContextType>({});

interface RadioProps {
  value: any;
  children: React.ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}

interface RadioGroupProps {
  value?: any;
  onChange?: (value: any) => void;
  children: React.ReactNode;
  style?: CSSProperties;
}

const $radioStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `2px solid #666666`,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  position: 'relative',
  marginRight: 8,
  flexShrink: 0
};

const $radioCheckedStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `2px solid ${colors.yellow}`,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  position: 'relative',
  marginRight: 8,
  flexShrink: 0
};

const $radioInnerStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: colors.yellow,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

const $radioContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginRight: 16
};

export function Radio({ value, children, disabled = false, style = {} }: RadioProps) {
  const context = useContext(RadioContext);
  const isChecked = context.value === value;

  const handleClick = () => {
    if (disabled || !context.onChange) return;
    context.onChange(value);
  };

  return (
    <div
      style={{
        ...$radioContainerStyle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      onClick={handleClick}>
      <div style={isChecked ? $radioCheckedStyle : $radioStyle}>{isChecked && <div style={$radioInnerStyle} />}</div>
      <Text text={typeof children === 'string' ? children : String(children)} />
    </div>
  );
}

export function RadioGroup({ value, onChange, children, style = {} }: RadioGroupProps) {
  const contextValue = {
    value,
    onChange
  };

  return (
    <RadioContext.Provider value={contextValue}>
      <div style={{ display: 'flex', alignItems: 'center', ...style }}>{children}</div>
    </RadioContext.Provider>
  );
}
