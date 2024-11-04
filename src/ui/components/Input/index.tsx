import { isNull } from 'lodash';
import React, { CSSProperties, useEffect, useState } from 'react';

import Web3API from '@/shared/web3/Web3API';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils';
import { AddressVerificator } from '@btc-vision/transaction';

import { useTools } from '../ActionComponent';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { $textPresets, Text } from '../Text';
import './index.less';

export interface InputProps {
    preset?: Presets;
    placeholder?: string;
    children?: React.ReactNode;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
    autoFocus?: boolean;
    defaultValue?: string;
    value?: string;
    style?: CSSProperties;
    containerStyle?: CSSProperties;
    addressInputData?: { address: string; domain: string };
    onAddressInputChange?: (params: { address: string; domain: string }) => void;
    onAmountInputChange?: (amount: string) => void;
    disabled?: boolean;
    disableDecimal?: boolean;
    enableBrc20Decimal?: boolean;
    runesDecimal?: number;
    enableMax?: boolean;
    onMaxClick?: () => void;
}

type Presets = keyof typeof $inputPresets;
const $inputPresets = {
    password: {},
    amount: {},
    address: {},
    text: {}
};

const $baseContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2626',
    paddingLeft: 15.2,
    paddingRight: 15.2,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 5,
    minHeight: '46.5px',
    alignSelf: 'stretch'
};

const $baseInputStyle: CSSProperties = Object.assign({}, $textPresets.regular, {
    display: 'flex',
    flex: 1,
    borderWidth: 0,
    outlineWidth: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    alignSelf: 'stretch'
});

function PasswordInput(props: InputProps) {
    const { placeholder, containerStyle, style: $inputStyleOverride, ...rest } = props;
    const [type, setType] = useState<'password' | 'text'>('password');
    return (
        <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
            <input
                placeholder={isNull(placeholder) ? 'Password' : placeholder}
                type={type}
                style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
                {...rest}
            />
            {type === 'password' && (
                <Icon
                    icon="eye-slash"
                    style={{ marginLeft: spacing.tiny }}
                    onClick={() => setType('text')}
                    color="textDim"
                />
            )}
            {type === 'text' && (
                <Icon icon="eye" style={{ marginLeft: spacing.tiny }} onClick={() => setType('password')} />
            )}
        </div>
    );
}

function AmountInput(props: InputProps) {
    const {
        placeholder,
        onAmountInputChange,
        disabled,
        style: $inputStyleOverride,
        disableDecimal,
        enableBrc20Decimal,
        runesDecimal,
        enableMax,
        onMaxClick,
        ...rest
    } = props;
    const $style = Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {});

    if (!onAmountInputChange) {
        return <div />;
    }
    const [inputValue, setInputValue] = useState(props.value ?? '');
    const [validAmount, setValidAmount] = useState(props.value ?? '');
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
                if (/^\d+\.?\d{0,18}$/.test(value) || value === '') {
                    setValidAmount(value);
                    setInputValue(value);
                }
            } else if (runesDecimal !== undefined) {
                const regex = new RegExp(`^\\d+\\.?\\d{0,${runesDecimal}}$`);
                if (regex.test(value) || value === '') {
                    setValidAmount(value);
                    setInputValue(value);
                }
            } else {
                if (/^\d*\.?\d{0,8}$/.test(value) || value === '') {
                    setValidAmount(value);
                    setInputValue(value);
                }
            }
        }
    };
    return (
        <div style={$baseContainerStyle}>
            <input
                placeholder={placeholder ?? 'Amount'}
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
                    text={'Max'}
                    color={'yellow'}
                    size="sm"
                />
            ) : null}
        </div>
    );
}

export const AddressInput = (props: InputProps) => {
    const { placeholder, onAddressInputChange, addressInputData, style: $inputStyleOverride, ...rest } = props;

    if (!addressInputData || !onAddressInputChange) {
        return <div />;
    }
    const [validAddress, setValidAddress] = useState(addressInputData.address);
    const [parseAddress, setParseAddress] = useState(addressInputData.domain ? addressInputData.address : '');
    const [parseError, setParseError] = useState('');
    const [formatError, setFormatError] = useState('');

    const [inputVal, setInputVal] = useState(addressInputData.domain || addressInputData.address);

    const [parseName, setParseName] = useState('');
    const wallet = useWallet();
    const tools = useTools();
    useEffect(() => {
        onAddressInputChange({
            address: validAddress,
            domain: parseAddress ? inputVal : ''
        });
    }, [validAddress]);

    const [searching, setSearching] = useState(false);

    const resetState = () => {
        if (parseError) {
            setParseError('');
        }
        if (parseAddress) {
            setParseAddress('');
        }
        if (formatError) {
            setFormatError('');
        }

        if (validAddress) {
            setValidAddress('');
        }

        setParseName('');
    };

    const handleInputAddress = (e) => {
        const inputAddress = e.target.value.trim();
        setInputVal(inputAddress);

        resetState();

        const isValid = AddressVerificator.detectAddressType(inputAddress, Web3API.network);
        if (!isValid) {
            setFormatError('Recipient address is invalid');
            return;
        }

        setValidAddress(inputAddress);
    };

    return (
        <div style={{ alignSelf: 'stretch' }}>
            <div style={Object.assign({}, $baseContainerStyle, { flexDirection: 'column', minHeight: '56.5px' })}>
                <input
                    placeholder={'Address or name (sats, unisat, ...) '}
                    type={'text'}
                    style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
                    onChange={(e) => {
                        handleInputAddress(e);
                    }}
                    defaultValue={inputVal}
                    {...rest}
                />

                {searching && (
                    <Row full mt="sm">
                        <Text preset="sub" text={'Loading...'} />
                    </Row>
                )}
            </div>

            {parseName ? (
                <Row mt="sm" gap="zero" itemsCenter>
                    <Text preset="sub" size="sm" text={'Name recognized and resolved. ('} />
                    <Text
                        preset="link"
                        color="yellow"
                        text={'More details'}
                        onClick={() => {
                            window.open('https://docs.unisat.io/unisat-wallet/name-recognized-and-resolved');
                        }}
                    />
                    <Text preset="sub" size="sm" text={')'} />
                </Row>
            ) : null}
            {parseError && <Text text={parseError} preset="regular" color="error" />}
            <Text text={formatError} preset="regular" color="error" />
        </div>
    );
};

function TextInput(props: InputProps) {
    const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, ...rest } = props;
    return (
        <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
            <input
                placeholder={placeholder}
                type={'text'}
                disabled={disabled}
                autoFocus={autoFocus}
                style={Object.assign(
                    {},
                    $baseInputStyle,
                    $inputStyleOverride,
                    disabled ? { color: colors.textDim } : {}
                )}
                {...rest}
            />
        </div>
    );
}

export function Input(props: InputProps) {
    const { preset } = props;

    if (preset === 'password') {
        return <PasswordInput {...props} />;
    } else if (preset === 'amount') {
        return <AmountInput {...props} />;
    } else if (preset === 'address') {
        return <AddressInput {...props} />;
    } else {
        return <TextInput {...props} />;
    }
}
