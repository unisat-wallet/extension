import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useOrdinalsTx, usePrepareSendOrdinalsInscriptionCallback } from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function SendOrdinalsInscriptionScreen() {
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
  const prepareSendOrdinalsInscription = usePrepareSendOrdinalsInscriptionCallback();

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
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

    prepareSendOrdinalsInscription({
      toAddressInfo: toInfo,
      inscriptionId: inscription.inscriptionId,
      feeRate,
      outputValue,
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
        title="Send Inscription"
      />
      <Content>
        <Column>
          <Row justifyBetween>
            <Text text="Ordinals Inscription" color="textDim" />
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

          <Column mt="lg">
            <Text text="OutputValue" color="textDim" />

            <OutputValueBar
              defaultValue={defaultOutputValue}
              onChange={(val) => {
                setOutputValue(val);
              }}
            />
          </Column>

          <Column mt="lg">
            <Text text="Fee" color="textDim" />

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
            text="Next"
            onClick={(e) => {
              navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
