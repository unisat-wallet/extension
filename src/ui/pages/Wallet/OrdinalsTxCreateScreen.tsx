import { Button, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import { AddressInputBar } from '@/ui/components/AddressInputBar';
import CHeader from '@/ui/components/CHeader';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCreateOrdinalsTxCallback, useFetchUtxosCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
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
  const [toAddress, setToAddress] = useState(ordinalsTx.toAddress);
  const [error, setError] = useState('');
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const fetchUtxos = useFetchUtxosCallback();

  useEffect(() => {
    fetchUtxos();
  }, []);

  const [feeRate, setFeeRate] = useState(5);

  useEffect(() => {
    setDisabled(true);
    setError('');

    if (!isValidAddress(toAddress)) {
      return;
    }

    if (feeRate <= 0) {
      setError('Invalid fee rate');
      return;
    }

    if (toAddress == ordinalsTx.toAddress && feeRate == ordinalsTx.feeRate) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createOrdinalsTx(toAddress, inscription, feeRate)
      .then(() => {
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toAddress, feeRate]);

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

          <AddressInputBar
            defaultAddress={ordinalsTx.toAddress}
            onChange={(val) => {
              setToAddress(val);
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
