import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { useCreateOrdinalsTxCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function OrdinalsTxCreateScreen() {
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

  const [feeRate, setFeeRate] = useState(5);
  const defaultOutputValue = inscription ? inscription.outputValue : 10000;

  const minOutputValue = Math.max(inscription.offset, 546);
  const [outputValue, setOutputValue] = useState(defaultOutputValue);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  useEffect(() => {
    setDisabled(true);
    setError('');

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

    createOrdinalsTx(toInfo, inscription.inscriptionId, feeRate, outputValue)
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toInfo, feeRate, outputValue]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Send Inscription"
      />
      <Content>
        <Column>
          <Row justifyBetween>
            <Text text="Inscription" color="textDim" />
            {inscription && <InscriptionPreview data={inscription} preset="small" />}
          </Row>

          <Text text="Recipient" color="textDim" />

          <Input
            preset="address"
            addressInputData={toInfo}
            autoFocus={true}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
          />

          <Text text="OutputValue" color="textDim" />

          <OutputValueBar
            defaultValue={defaultOutputValue}
            onChange={(val) => {
              setOutputValue(val);
            }}
          />

          <Text text="Fee" color="textDim" />

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />

          {error && <Text text={error} color="error" />}
          <Button
            disabled={disabled}
            preset="primary"
            text="Next"
            onClick={(e) => {
              navigate('OrdinalsTxConfirmScreen', { rawTxInfo });
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
