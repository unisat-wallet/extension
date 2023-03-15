import { Button, Input, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCreateOrdinalsTxCallback, useFetchUtxosCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

import wallet from '@/background/controller/wallet';
import { API_STATUS, DomainInfo } from '@/background/service/domainService';
import { BTCDOMAINS_LINK, DOMAIN_LEVEL_ONE } from '@/shared/constant';

import '@/ui/styles/domain.less';

export default function OrdinalsTxCreateScreen() {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { inscription } = state as {
    inscription: Inscription;
  };
  const ordinalsTx = useOrdinalsTx();
  const [inputAddress, setInputAddress] = useState(ordinalsTx.toAddress);
  const [error, setError] = useState('');
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const fetchUtxos = useFetchUtxosCallback();

  const [parseAddress, setParseAddress] = useState('');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

  useEffect(() => {
    fetchUtxos();
  }, []);

  useEffect(() => {
    setDisabled(true);
    setError('');
    let toAddress = '';
    if (inputAddress.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
      toAddress = parseAddress;
    } else {
      toAddress = inputAddress
    }

    if (!isValidAddress(toAddress)) {
      return;
    }

    if (toAddress == ordinalsTx.toAddress) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createOrdinalsTx(toAddress, inscription)
      .then(() => {
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [inputAddress]);

  const handleInputAddress = (input: string) => {
    if (parseError) {
      setParseError('');
    }
    if (parseAddress) {
      setParseAddress('');
    }
    if (formatError) {
      setFormatError('');
    }

    setInputAddress(input);

    if (input.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
      const reg = /^[0-9a-zA-Z.]*$/
      if (reg.test(input)) {
        wallet.queryDomainInfo(input).then((ret: DomainInfo) => {
          setParseAddress(ret.receive_address);
          setParseError('');
          setFormatError('');
        }).catch((err: Error) => {
          setParseAddress('')
          const errMsg = err.message + ' for ' + input;
          if (err.cause == API_STATUS.NOTFOUND) {
            setParseError(errMsg);
            setFormatError('');
          } else {
            setParseError('');
            setFormatError(errMsg);
          }
        })
      } else {
        setParseAddress('');
        setParseError('');
        setFormatError('domain name format is not correct.');
      }
    } else {
      setParseAddress('');
      setParseError('');
      setFormatError('domain name must matching ' + DOMAIN_LEVEL_ONE + ' suffix.');
    }
  };

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Send Inscription"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span className="flex items-center justify-center ">{t('Inscription')}</span>
            {inscription && <InscriptionPreview data={inscription} size="small" />}
          </div>

          <Input
            className="!mt-5 font-semibold text-white h-15_5 box default hover"
            placeholder={t('Recipients BTC address')}
            defaultValue={inputAddress}
            onChange={async (e) => {
              handleInputAddress(e.target.value);
            }}
            autoFocus={true}
          />

          {parseAddress ? (
            <div className="word-breakall">{parseAddress}</div>
          ) : null}

          {parseError ? (
            <span className="text-lg text-warn h-5">{`${parseError}` + ' is not occupied, click '}<a href={BTCDOMAINS_LINK} target={'_blank'} rel="noreferrer">btcdomains</a> to register.</span>
          ) : null}

          <span className="text-lg text-error h-5">{formatError}</span>

          <span className="text-lg text-error h-5">{error}</span>
          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              navigate('OrdinalsTxConfirmScreen');
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
