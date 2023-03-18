import { Button, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import { AddressInputBar } from '@/ui/components/AddressInputBar';
import CHeader from '@/ui/components/CHeader';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import {
  useCreateOrdinalsTxCallback,
  useFetchUtxosCallback,
  useOrdinalsTx,
  useUtxos
} from '@/ui/state/transactions/hooks';
import '@/ui/styles/domain.less';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function OrdinalsTxCreateScreen() {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { inscription } = state as {
    inscription: Inscription;
  };
  const ordinalsTx = useOrdinalsTx();
  const [toInfo, setToInfo] = useState({
    address: ordinalsTx.toAddress,
    domain: ordinalsTx.toDomain
  });

  const [error, setError] = useState('');
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const fetchUtxos = useFetchUtxosCallback();

  useEffect(() => {
    fetchUtxos();
  }, []);

  const utxos = useUtxos();

  const hasMultiInscriptions = useMemo(() => {
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      if (utxo.inscriptions.find((v) => v.id === inscription.id)) {
        if (utxo.inscriptions.length > 1) {
          return true;
        }
      }
    }
    return false;
  }, [utxos]);

  const [feeRate, setFeeRate] = useState(5);
  const defaultOutputValue = inscription.detail ? parseInt(inscription.detail.output_value) : 10000;

  const minOutputValue = Math.max(parseInt(inscription.detail?.offset || '0'), 546);
  const [outputValue, setOutputValue] = useState(defaultOutputValue);
  useEffect(() => {
    setDisabled(true);
    setError('');

    if (hasMultiInscriptions) {
      setError('Multiple inscriptions are mixed together. Please split them first.');
      return;
    }

    if (feeRate <= 0) {
      setError('Invalid fee rate');
      return;
    }

    if (outputValue < minOutputValue) {
      setError(`OutputValue must be at least ${minOutputValue}`);
      return;
    }

    if (!outputValue) {
      return;
    }

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    if (
      toInfo.address == ordinalsTx.toAddress &&
      feeRate == ordinalsTx.feeRate &&
      outputValue == ordinalsTx.outputValue
    ) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createOrdinalsTx(toInfo, inscription, feeRate, outputValue)
      .then(() => {
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toInfo, feeRate, outputValue]);

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

          <div className="flex justify-between w-full mt-5 box text-soft-white">
            <span>{t('Recipient')}</span>
          </div>
          <AddressInputBar
            defaultInfo={toInfo}
            onChange={(val) => {
              setToInfo(val);
            }}
          />

          <div className="flex justify-between w-full box text-soft-white">
            <span>{t('OutputValue')}</span>
          </div>
          <OutputValueBar
            defaultValue={defaultOutputValue}
            onChange={(val) => {
              setOutputValue(val);
            }}
          />

          <div className="flex justify-between w-full box text-soft-white">
            <span>{t('Fee')}</span>
          </div>
          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />
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
