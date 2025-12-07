import React, { CSSProperties } from 'react';

import { Inscription } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { ChainType } from '@unisat/wallet-types';
import { $textPresets } from '../Text';
import { AddressInput } from './AddressInput';
import { AmountInput } from './AmountInput';
import { CosmosAddressInput } from './CosmosAddressInput';
import { PasswordInput } from './PasswordInput';
import { SearchInput } from './SearchInput';
import { TextInput } from './TextInput';

export interface InputProps {
  preset?: Presets;
  placeholder?: string;
  children?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  autoFocus?: boolean;
  defaultValue?: string;
  value?: string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  addressInputData?: { address: string; domain: string };
  onAddressInputChange?: (params: { address: string; domain: string; inscription?: Inscription }) => void;
  onAmountInputChange?: (amount: string) => void;
  disabled?: boolean;
  disableDecimal?: boolean;
  enableBrc20Decimal?: boolean;
  runesDecimal?: number;
  enableMax?: boolean;
  onMaxClick?: () => void;
  onSearch?: () => void;
  recipientLabel?: React.ReactNode;
  networkType?: ChainType;
  addressPlaceholder?: string;
  maxLength?: number;
  enableStepper?: boolean;
  step?: number;
  min?: number;
}

type Presets = keyof typeof $inputPresets;
const $inputPresets = {
  password: {},
  amount: {},
  address: {},
  cosmosAddress: {},
  text: {},
  search: {}
};

export const $baseContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.black,
  paddingLeft: 15.2,
  paddingRight: 15.2,
  paddingTop: 11,
  paddingBottom: 11,
  borderRadius: 10,
  minHeight: '56.5px',
  alignSelf: 'stretch',
  borderWidth: 1,
  borderColor: colors.line2
};

export const $baseInputStyle: CSSProperties = Object.assign({}, $textPresets.regular, {
  display: 'flex',
  flex: 1,
  borderWidth: 0,
  outlineWidth: 0,
  backgroundColor: 'rgba(0,0,0,0)',
  alignSelf: 'stretch'
});

export const $baseTextareaStyle: CSSProperties = Object.assign({}, $baseInputStyle, {
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  resize: 'none',
  border: 'none',
  padding: '11px 0',
  height: 'auto',
  minHeight: '22px',
  background: 'transparent',
  lineHeight: '22px'
});

export function Input(props: InputProps) {
  const { preset } = props;

  if (preset === 'password') {
    return <PasswordInput {...props} />;
  } else if (preset === 'amount') {
    return <AmountInput {...props} />;
  } else if (preset === 'address') {
    return <AddressInput {...props} />;
  } else if (preset === 'cosmosAddress') {
    return <CosmosAddressInput {...props} />;
  } else if (preset === 'search') {
    return <SearchInput {...props} />;
  } else {
    return <TextInput {...props} />;
  }
}
