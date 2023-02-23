import { Button, Input } from 'antd';
import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCreateOrdinalsTxCallback, useFetchUtxosCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

type InputState = '' | 'error' | 'warning' | undefined;

export default function OrdinalsTxCreateScreen() {
  const { t } = useTranslation();
  const [statueAdd, setStatueAdd] = useState<InputState>('');
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
  const verify = () => {
    setStatueAdd('');
    if (!isValidAddress(inputAddress)) {
      setStatueAdd('error');
      setError(t('Invalid_address'));
      return;
    }
    // to verify
    navigate('OrdinalsTxConfirmScreen');
  };

  useEffect(() => {
    fetchUtxos();
  }, []);

  useEffect(() => {
    setError('');
    const toAddress = inputAddress;
    if (!isValidAddress(toAddress)) {
      return;
    }

    if (toAddress == ordinalsTx.toAddress) {
      //Prevent repeated triggering caused by setAmount
      return;
    }

    const run = async () => {
      createOrdinalsTx(toAddress, inscription)
        .then()
        .catch((e) => {
          setError(e.message);
        });
    };

    run();
  }, [inputAddress]);

  useEffect(() => {
    setDisabled(true);
    if (ordinalsTx.toAddress) {
      setDisabled(false);
    }
  }, [ordinalsTx]);

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Send')} Ordinals</div>

          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span className="flex items-center justify-center ">{t('Ordinals')}</span>
            {inscription && <InscriptionPreview data={inscription} className=" w-37_5 h-37_5" />}
          </div>

          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span>{t('Fee')}</span>
            <span>
              <span className="font-semibold text-white">{ordinalsTx.fee.toFixed(8)}</span> BTC
            </span>
          </div>

          <Input
            className="!mt-5 font-semibold text-white h-15_5 box default hover"
            placeholder={t('Recipients BTC address')}
            status={statueAdd}
            defaultValue={inputAddress}
            onChange={async (e) => {
              setInputAddress(e.target.value);
            }}
          />

          <span className="text-lg text-error">{error}</span>
          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              verify();
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
