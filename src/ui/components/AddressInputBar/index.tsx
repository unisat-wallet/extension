import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { API_STATUS } from '@/background/service/domainService';
import { BTCDOMAINS_LINK, BTC_DOMAIN_LEVEL_ONE } from '@/shared/constant';
import { useWallet } from '@/ui/utils';

export const AddressInputBar = ({
  defaultAddress,
  onChange
}: {
  defaultAddress: string;
  onChange: (val: string) => void;
}) => {
  const [parseAddress, setParseAddress] = useState('');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

  const [inputVal, setInputVal] = useState(defaultAddress);

  const wallet = useWallet();

  useEffect(() => {
    let toAddress = '';
    if (inputVal.toLowerCase().endsWith(BTC_DOMAIN_LEVEL_ONE)) {
      toAddress = parseAddress;
    } else {
      toAddress = inputVal;
    }
    onChange(toAddress);
  }, []);

  const selfRef = useRef({
    lastCheckAddress: ''
  });
  const self = selfRef.current;
  const handleInputAddress = () => {
    if (self.lastCheckAddress === inputVal) {
      return;
    }
    self.lastCheckAddress = inputVal;

    if (parseError) {
      setParseError('');
    }
    if (parseAddress) {
      setParseAddress('');
    }
    if (formatError) {
      setFormatError('');
    }

    if (inputVal.toLowerCase().endsWith(BTC_DOMAIN_LEVEL_ONE)) {
      const reg = /^[0-9a-zA-Z.]*$/;
      if (reg.test(inputVal)) {
        wallet
          .queryDomainInfo(inputVal)
          .then((address: string) => {
            setParseAddress(address);
            setParseError('');
            setFormatError('');
          })
          .catch((err: Error) => {
            setParseAddress('');
            const errMsg = err.message + ' for ' + inputVal;
            if (err.cause == API_STATUS.NOTFOUND) {
              setParseError(errMsg);
              setFormatError('');
            } else {
              setParseError('');
              setFormatError(errMsg);
            }
          });
      } else {
        setParseAddress('');
        setParseError('');
        setFormatError('domain name format is not correct.');
      }
    }
    // else {
    //   setParseAddress('');
    //   setParseError('');
    //   setFormatError('domain name must matching ' + DOMAIN_LEVEL_ONE + ' suffix.');
    // }
  };

  return (
    <div>
      <Input
        className="mt-5 font-semibold text-white h-15_5 box default hover"
        // eslint-disable-next-line quotes
        placeholder={"Recipient's BTC address"}
        defaultValue={inputVal}
        onChange={async (e) => {
          setInputVal(e.target.value);
        }}
        onBlur={() => {
          handleInputAddress();
        }}
        onPressEnter={() => {
          handleInputAddress();
        }}
        autoFocus={true}
      />

      {parseAddress ? <div className="word-breakall">{parseAddress}</div> : null}

      {parseError ? (
        <span className="text-lg text-warn h-5">
          {`${parseError}` + ', click '}
          <a href={BTCDOMAINS_LINK} target={'_blank'} rel="noreferrer">
            btcdomains
          </a>{' '}
          to register.
        </span>
      ) : null}

      <span className="text-lg text-error h-5">{formatError}</span>
    </div>
  );
};
