import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Atomical, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import AtomicalsNFTPreview from '@/ui/components/AtomicalsNFTPreview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useI18n } from '@/ui/hooks/useI18n';
import {
  useFetchUtxosCallback,
  useOrdinalsTx,
  usePrepareSendAtomicalsNFTCallback
} from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function SendAtomicalsInscriptionScreen() {
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { state } = useLocation();
  const { atomical } = state as {
    atomical: Atomical;
  };
  const ordinalsTx = useOrdinalsTx();
  const [toInfo, setToInfo] = useState({
    address: ordinalsTx.toAddress,
    domain: ordinalsTx.toDomain
  });

  const fetchUtxos = useFetchUtxosCallback();
  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const [error, setError] = useState('');
  const prepareSendAtomicalsNFT = usePrepareSendAtomicalsNFTCallback();

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
  const defaultOutputValue = atomical ? atomical.outputValue : 10000;

  const minOutputValue = Math.max(atomical.offset, 546);
  const [outputValue, setOutputValue] = useState(defaultOutputValue);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  useEffect(() => {
    setDisabled(true);
    setError('');

    if (feeRate <= 0) {
      setError(t('invalid_fee_rate'));
      return;
    }

    if (outputValue < minOutputValue) {
      setError(`${t('output_value_must_be_at_least')} ${minOutputValue}`);
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

    prepareSendAtomicalsNFT({
      toAddressInfo: toInfo,
      atomicalId: atomical.atomicalId,
      feeRate,
      enableRBF
    })
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toInfo, feeRate, outputValue, enableRBF]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('send_atomicals_inscription')}
      />
      <Content>
        <Column>
          <Row justifyBetween>
            <Text text={t('inscription')} color="textDim" />
            {atomical && <AtomicalsNFTPreview data={atomical} preset="small" />}
          </Row>

          <Input
            preset="address"
            addressInputData={toInfo}
            autoFocus={true}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
          />

          <Column mt="lg">
            <Text text={t('fee')} color="textDim" />

            <FeeRateBar
              onChange={(val) => {
                setFeeRate(val);
              }}
            />
          </Column>

          <Column mt="lg">
            <RBFBar
              onChange={(val) => {
                setEnableRBF(val);
              }}
            />
          </Column>

          {error && <Text text={error} color="error" />}
          <Button
            disabled={disabled}
            preset="primary"
            text={t('next')}
            onClick={(e) => {
              // todo
              // navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
