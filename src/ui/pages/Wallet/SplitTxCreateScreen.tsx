import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { useCreateSplitTxCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { isValidAddress, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function SplitTxCreateScreen() {
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { inscription } = state as {
    inscription: Inscription;
  };
  const ordinalsTx = useOrdinalsTx();

  const [error, setError] = useState('');
  const createSplitTx = useCreateSplitTxCallback();

  const [feeRate, setFeeRate] = useState(5);
  const defaultOutputValue = inscription ? inscription.outputValue : 10000;
  const minOutputValue = 546;
  const [outputValue, setOutputValue] = useState(defaultOutputValue);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  const [splitedCount, setSplitedCount] = useState(0);
  const wallet = useWallet();
  useEffect(() => {
    wallet.getInscriptionUtxoDetail(inscription.inscriptionId).then((v) => {
      setInscriptions(v.inscriptions);
    });
  }, []);

  useEffect(() => {
    setDisabled(true);
    setError('');
    setSplitedCount(0);

    if (feeRate <= 0) {
      setError('Invalid fee rate');
      return;
    }

    if (!outputValue) {
      return;
    }

    if (outputValue < minOutputValue) {
      setError(`OutputValue must be at least ${minOutputValue}`);
      return;
    }

    if (feeRate == ordinalsTx.feeRate && outputValue == ordinalsTx.outputValue) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createSplitTx(inscription.inscriptionId, feeRate, outputValue)
      .then((data) => {
        setRawTxInfo(data.rawTxInfo);
        setSplitedCount(data.splitedCount);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [feeRate, outputValue]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Split Inscriptions"
      />
      <Content>
        <Text
          color="red"
          textCenter
          text={
            'This feature is currently under experimentation. Please confirm the inscription splitting status of the transaction when signing the transaction.'
          }
        />
        <Column>
          <Text text={`Inscriptions (${inscriptions.length})`} color="textDim" />
          <Row justifyBetween>
            <Row overflowX gap="lg" pb="md">
              {inscriptions.map((v) => (
                <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
              ))}
            </Row>
          </Row>

          <Text text="Each OutputValue" color="textDim" />

          <OutputValueBar
            defaultValue={minOutputValue}
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

          {inscriptions.length > 1 && splitedCount > 0 && (
            <Text text={`Spliting to ${splitedCount} UTXO`} color="primary" />
          )}

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
