import { Input } from 'antd';
import bitcore from 'bitcore-lib';
import { useEffect, useState } from 'react';

import { API_STATUS } from '@/background/service/domainService';
import { BTC_DOMAIN_LEVEL_ONE, SATS_DOMAIN } from '@/shared/constant';
import { useWallet } from '@/ui/utils';

import { AddressText } from '../AddressText';

export const AddressInputBar = ({
  defaultInfo,
  onChange
}: {
  defaultInfo: { address: string; domain: string };
  onChange: (params: { address: string; domain: string }) => void;
}) => {
  const [validAddress, setValidAddress] = useState(defaultInfo.address);
  const [parseAddress, setParseAddress] = useState(defaultInfo.address);
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
        .queryDomainInfo(inputAddress)
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
          if (err.cause == API_STATUS.NOTFOUND) {
            setParseError(errMsg);
          } else {
            setFormatError(errMsg);
          }
        });
    } else if (inputAddress.toLowerCase().endsWith(BTC_DOMAIN_LEVEL_ONE)) {
      const reg = /^[0-9a-zA-Z.]*$/;
      if (reg.test(inputAddress)) {
        wallet
          .queryDomainInfo(inputAddress)
          .then((address: string) => {
            setParseAddress(address);
            setValidAddress(address);
          })
          .catch((err: Error) => {
            const errMsg = err.message + ' for ' + inputAddress;
            if (err.cause == API_STATUS.NOTFOUND) {
              setParseError(`${inputAddress} does not exist`);
              // setParseError(errMsg);
            } else {
              setFormatError(errMsg);
            }
          });
      } else {
        setFormatError('Domain name format is not correct');
      }
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
    <div>
      <Input
        className="mt-5 font-semibold text-white h-15_5 box default hover"
        // eslint-disable-next-line quotes
        placeholder={'Address, name.sats, or name.btc '}
        defaultValue={inputVal}
        onChange={async (e) => {
          handleInputAddress(e);
        }}
        autoFocus={true}
      />

      {parseAddress && (
        <div
          className="flex py-1 px-5 bg-stone-800 items-center"
          style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-2">{'->'}</div>
          <AddressText address={parseAddress} />
        </div>
      )}

      {parseError ? <span className="text-lg text-error h-5">{`${parseError}`}</span> : null}

      <span className="text-lg text-error h-5">{formatError}</span>
    </div>
  );
};
