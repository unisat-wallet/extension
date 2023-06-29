import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCreateOrdinalsTxCallback, useCreateSplitTxCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
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

  const [toInfo, setToInfo] = useState({
    address: '',
    domain: ''
  });

  const [error, setError] = useState('');
  const createSplitTx = useCreateSplitTxCallback();

  const [feeRate, setFeeRate] = useState(5);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  const wallet = useWallet();
  useEffect(() => {
    wallet.getInscriptionUtxoDetail(inscription.inscriptionId).then((v) => {
      setInscriptions(v.inscriptions);
    });
  }, []);

  useEffect(() => {
    setDisabled(true);
    setError('');

    if (feeRate <= 0) {
      setError('Invalid fee rate');
      return;
    }

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    if (toInfo.address == ordinalsTx.toAddress && feeRate == ordinalsTx.feeRate) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createSplitTx(toInfo, inscription.inscriptionId, feeRate)
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toInfo, feeRate]);

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
          text={
            'This feature is currently under experimentation. Please verify splited inscriptions when signing the transaction.'
          }
        />
        <Column>
          <Row justifyBetween>
            <Text text="Inscriptions" color="textDim" />
            <Row overflowX gap="lg" pb="md">
              {inscriptions.map((v) => (
                <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
              ))}
            </Row>
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
