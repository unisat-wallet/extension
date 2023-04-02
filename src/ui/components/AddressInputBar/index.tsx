import bitcore from 'bitcore-lib';
import { useEffect, useState } from 'react';

import { SATS_DOMAIN } from '@/shared/constant';
import { useWallet } from '@/ui/utils';

import { AddressText } from '../AddressText';
import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';

export const AddressInputBar = ({
  defaultInfo,
  onChange
}: {
  defaultInfo: { address: string; domain: string };
  onChange: (params: { address: string; domain: string }) => void;
}) => {
  const [validAddress, setValidAddress] = useState(defaultInfo.address);
  const [parseAddress, setParseAddress] = useState(defaultInfo.domain ? defaultInfo.address : '');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

  const [inputVal, setInputVal] = useState(defaultInfo.domain || defaultInfo.address);

  const wallet = useWallet();

  useEffect(() => {
    onChange({
      address: validAddress,
      domain: parseAddress ? inputVal : ''
    });
  }, [validAddress]);

  const handleInputAddress = (e) => {
    const inputAddress = e.target.value;
    setInputVal(inputAddress);

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

    if (inputAddress.toLowerCase().endsWith(SATS_DOMAIN)) {
      wallet
        .queryDomainInfo(encodeURIComponent(inputAddress))
        .then((address: string) => {
          if (address) {
            setParseAddress(address);
            setValidAddress(address);
          } else {
            setParseError(`${inputAddress} does not exist`);
          }
        })
        .catch((err: Error) => {
          const errMsg = err.message + ' for ' + inputAddress;
          setFormatError(errMsg);
        });
    } else {
      const isValid = bitcore.Address.isValid(inputAddress);
      if (!isValid) {
        setFormatError('Recipient address is invalid');
        return;
      }
      setValidAddress(inputAddress);
    }
  };

  return (
    <Column>
      <Input
        placeholder={'Address, name.sats '}
        defaultValue={inputVal}
        onChange={async (e) => {
          handleInputAddress(e);
        }}
        autoFocus={true}
        style={{ alignSelf: 'auto' }}
      />

      {parseAddress && (
        <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'black' }}>
          <Text text={'->'} />
          <AddressText address={parseAddress} />
        </Row>
      )}

      {parseError && <Text text={parseError} color="danger" />}
      {formatError && <Text text={formatError} color="danger" />}
    </Column>
  );
};
