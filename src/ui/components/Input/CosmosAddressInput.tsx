import { useEffect, useState } from 'react';

import { Text } from '@/ui/components';
import { useI18n } from '@unisat/wallet-state';

import { isValidBech32Address } from '@/ui/utils';
import { $baseContainerStyle, $baseInputStyle, InputProps } from '.';

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
