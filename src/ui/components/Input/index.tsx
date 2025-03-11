import bitcore from 'bitcore-lib';
import { isNull } from 'lodash';
import React, { CSSProperties, useEffect, useState } from 'react';

import { ChainType, SAFE_DOMAIN_CONFIRMATION } from '@/shared/constant';
import { getSatsName } from '@/shared/lib/satsname-utils';
import { Inscription } from '@/shared/types';
import { Icon, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { getAddressTips, useChain } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { isValidBech32Address, useWallet } from '@/ui/utils';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';

import { AccordingInscription } from '../AccordingInscription';
import { Column } from '../Column';
import { ContactsModal } from '../ContactsModal';
import { CopyableAddress } from '../CopyableAddress';
import { $textPresets } from '../Text';
import './index.less';

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

const $baseContainerStyle: CSSProperties = {
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

const $baseInputStyle: CSSProperties = Object.assign({}, $textPresets.regular, {
  display: 'flex',
  flex: 1,
  borderWidth: 0,
  outlineWidth: 0,
  backgroundColor: 'rgba(0,0,0,0)',
  alignSelf: 'stretch'
});

const $baseTextareaStyle: CSSProperties = Object.assign({}, $baseInputStyle, {
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

function PasswordInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, ...rest } = props;
  const { t } = useI18n();
  const [type, setType] = useState<'password' | 'text'>('password');
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input
        placeholder={isNull(placeholder) ? t('password') : placeholder}
        type={type}
        style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
        {...rest}
      />
      {type === 'password' && (
        <Icon icon="eye-slash" style={{ marginLeft: spacing.tiny }} onClick={() => setType('text')} color="textDim" />
      )}
      {type === 'text' && <Icon icon="eye" style={{ marginLeft: spacing.tiny }} onClick={() => setType('password')} />}
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
    containerStyle,
    runesDecimal,
    enableMax,
    onMaxClick,
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
    </div>
  );
}

export const AddressInput = (props: InputProps) => {
  const { t } = useI18n();
  const {
    placeholder,
    onAddressInputChange,
    addressInputData,
    style: $inputStyleOverride,
    networkType: propsNetworkType,
    recipientLabel,
    ...rest
  } = props;

  if (!addressInputData || !onAddressInputChange) {
    return <div />;
  }

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [validAddress, setValidAddress] = useState(addressInputData.address || '');
  const [parseName, setParseName] = useState<boolean>(false);
  const [parseAddress, setParseAddress] = useState(addressInputData.domain ? addressInputData.address : '');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');
  const [inscription, setInscription] = useState<Inscription>();
  const [inputVal, setInputVal] = useState(addressInputData.domain || addressInputData.address || '');
  const [searching, setSearching] = useState(false);
  const [addressTip, setAddressTip] = useState('');

  const wallet = useWallet();
  const chain = useChain();
  const networkType = propsNetworkType || chain.enum;

  let SUPPORTED_DOMAINS = ['sats', 'unisat', 'x', 'btc'];
  let inputAddressPlaceholder = props.addressPlaceholder || t('address_or_name_sats_unisat_etc');
  if (chain.isFractal) {
    SUPPORTED_DOMAINS = ['fb'];
    inputAddressPlaceholder = t('address_or_name_fb');
  }

  useEffect(() => {
    onAddressInputChange({
      address: validAddress,
      domain: parseAddress ? inputVal : '',
      inscription
    });

    const addressTips = getAddressTips(validAddress, chain.enum);
    if (addressTips.sendTip) {
      setAddressTip(addressTips.sendTip);
    } else {
      setAddressTip('');
    }
  }, [validAddress]);

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

    if (inscription) {
      setInscription(undefined);
    }
    setParseName(false);
  };

  const handleInputAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputAddress = e.target.value.trim();
    setInputVal(inputAddress);

    resetState();

    const teststr = inputAddress.toLowerCase();
    const satsname = getSatsName(teststr);
    if (satsname) {
      if (SUPPORTED_DOMAINS.includes(satsname.suffix)) {
        setSearching(true);
        wallet
          .queryDomainInfo(encodeURIComponent(inputAddress))
          .then((inscription) => {
            resetState();
            if (!inscription) {
              setParseError(`${inputAddress} ${t('does_not_exist')}`);
              return;
            }
            setInscription(inscription);
            if (inscription.utxoConfirmation < SAFE_DOMAIN_CONFIRMATION) {
              setParseError(
                `${t('this_domain_has_been_transferred_or_inscribed_recently_please_wait_for_block_confirmations')} (${
                  inscription.utxoConfirmation
                }/${SAFE_DOMAIN_CONFIRMATION}).`
              );
              return;
            }

            const address = inscription.address || '';
            setParseAddress(address);
            setValidAddress(address);
            setParseName(true);
          })
          .catch((err: Error) => {
            const errMsg = err.message + ' for ' + inputAddress;
            setFormatError(errMsg);
          })
          .finally(() => {
            setSearching(false);
          });
      } else {
        const names = SUPPORTED_DOMAINS.map((v) => `.${v}`);
        let str = '';
        for (let i = 0; i < names.length; i++) {
          if (i == 0) {
            // empty
          } else if (i < names.length - 1) {
            str += ', ';
          } else {
            str += ' and ';
          }
          str += `${names[i]}`;
        }
        setFormatError(`${t('currently_only')} ${str} ${t('are_supported')}.`);
        return;
      }
    } else {
      const isValid = bitcore.Address.isValid(inputAddress);
      if (!isValid) {
        setFormatError(t('recipient_address_is_invalid'));
        return;
      }
      setValidAddress(inputAddress);
    }
  };

  return (
    <div style={{ alignSelf: 'stretch' }}>
      <Row justifyBetween itemsCenter style={{ marginTop: 20, marginBottom: 12 }}>
        {recipientLabel || <Text text={t('recipient')} preset="regular" />}
        <Row itemsCenter clickable onClick={() => setShowContactsModal(true)} style={{ cursor: 'pointer', gap: 0 }}>
          <Text text={t('address_book_placeholder')} color="yellow" style={{ fontSize: '14px' }} />
          <Icon icon="right" color="yellow" size={16} style={{ marginLeft: 4 }} />
        </Row>
      </Row>
      <div
        style={Object.assign({}, $baseContainerStyle, {
          flexDirection: 'column',
          minHeight: '56.5px',
          paddingTop: 0,
          paddingBottom: 0
        })}>
        <Row full itemsCenter>
          <textarea
            placeholder={inputAddressPlaceholder}
            style={Object.assign({}, $baseTextareaStyle, $inputStyleOverride)}
            onChange={handleInputAddress}
            value={inputVal}
            rows={inputVal && inputVal.length > 50 ? 2 : 1}
            {...rest}
          />
        </Row>

        {searching && (
          <Row full mt="sm">
            <Text preset="sub" text={t('loading')} />
          </Row>
        )}
        {inscription && (
          <Row full itemsCenter mt="sm">
            <CopyableAddress address={parseAddress} />
            <AccordingInscription inscription={inscription} />
          </Row>
        )}
      </div>

      {parseName ? (
        <Row mt="sm" gap="zero" itemsCenter>
          <Text preset="sub" size="sm" text={t('name_recognized_and_resolved')} />
          <Text
            preset="link"
            color="yellow"
            text={t('more_details')}
            onClick={() => {
              window.open('https://docs.unisat.io/unisat-wallet/name-recognized-and-resolved');
            }}
          />
          <Text preset="sub" size="sm" text={')'} />
        </Row>
      ) : null}
      {parseError && <Text text={parseError} preset="regular" color="error" />}
      {addressTip && (
        <Column
          py={'lg'}
          px={'md'}
          mt="md"
          gap={'lg'}
          style={{
            borderRadius: 12,
            border: '1px solid rgba(245, 84, 84, 0.35)',
            background: 'rgba(245, 84, 84, 0.08)'
          }}>
          <Text text={addressTip} preset="regular" color="warning" />
        </Column>
      )}
      <Text text={formatError} preset="regular" color="error" />

      {showContactsModal && (
        <ContactsModal
          onClose={() => setShowContactsModal(false)}
          onSelect={(contact) => {
            setInputVal(contact.address);
            resetState();
            const addressValue = contact.address.trim();

            if (bitcore.Address.isValid(addressValue)) {
              setValidAddress(addressValue);
            } else {
              setFormatError(t('recipient_address_is_invalid'));
            }

            setShowContactsModal(false);
          }}
          selectedNetworkFilter={networkType}
        />
      )}
    </div>
  );
};

export const CosmosAddressInput = (props: InputProps) => {
  const { placeholder, onAddressInputChange, addressInputData, style: $inputStyleOverride, ...rest } = props;
  const { t } = useI18n();
  if (!addressInputData || !onAddressInputChange) {
    return <div />;
  }
  const [validAddress, setValidAddress] = useState(addressInputData.address);
  const [parseAddress, setParseAddress] = useState(addressInputData.domain ? addressInputData.address : '');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

  const [inputVal, setInputVal] = useState(addressInputData.domain || addressInputData.address);

  useEffect(() => {
    onAddressInputChange({
      address: validAddress,
      domain: parseAddress ? inputVal : ''
    });
  }, [validAddress]);

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
  };

  const handleInputAddress = (e) => {
    const inputAddress: string = e.target.value.trim();
    setInputVal(inputAddress);

    resetState();

    if (!isValidBech32Address(inputAddress)) {
      setFormatError(t('recipient_address_is_invalid'));
      return;
    }

    setValidAddress(inputAddress);
  };

  return (
    <div style={{ alignSelf: 'stretch' }}>
      <div style={Object.assign({}, $baseContainerStyle, { flexDirection: 'column', minHeight: '56.5px' })}>
        <input
          placeholder={placeholder}
          type={'text'}
          style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
          onChange={async (e) => {
            handleInputAddress(e);
          }}
          defaultValue={inputVal}
          {...rest}
        />
      </div>

      {parseError && <Text text={parseError} preset="regular" color="error" />}

      <Text text={formatError} preset="regular" color="error" />
    </div>
  );
};

function SearchInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, onSearch, ...rest } = props;
  return (
    <Row
      style={Object.assign(
        {},
        $baseContainerStyle,
        {
          backgroundColor: '#2a2626',
          border: '1px solid #C08F23',
          borderRadius: 8,
          padding: 0,
          alignSelf: 'stretch'
        },
        containerStyle
      )}>
      <Row py={'md'} px={'lg'} full itemsCenter>
        <SearchOutlined style={{ color: '#888' }} />
        <input
          placeholder={placeholder}
          type={'text'}
          disabled={disabled}
          autoFocus={autoFocus}
          style={Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {})}
          {...rest}
        />
      </Row>
      <Row
        onClick={onSearch}
        itemsCenter
        justifyCenter
        clickable
        style={{
          cursor: 'pointer',
          height: 42.5,
          width: 42.5,
          borderLeft: '1px solid #C08F23'
        }}>
        <ArrowRightOutlined style={{ color: 'rgba(255,255,255,.85)' }} />
      </Row>
    </Row>
  );
}

function TextInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, maxLength, ...rest } = props;
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input
        placeholder={placeholder}
        type={'text'}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        style={Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {})}
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
  } else if (preset === 'cosmosAddress') {
    return <CosmosAddressInput {...props} />;
  } else if (preset === 'search') {
    return <SearchInput {...props} />;
  } else {
    return <TextInput {...props} />;
  }
}
