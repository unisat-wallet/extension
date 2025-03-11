import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useI18n } from '@/ui/hooks/useI18n';
import {
  useFetchUtxosCallback,
  useOrdinalsTx,
  usePrepareSendOrdinalsInscriptionCallback
} from '@/ui/state/transactions/hooks';
import { isValidAddress, useWallet } from '@/ui/utils';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

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
  const { t } = useI18n();

  const fetchBtcUtxos = useFetchUtxosCallback();
  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    fetchBtcUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const [error, setError] = useState('');
  const prepareSendOrdinalsInscription = usePrepareSendOrdinalsInscriptionCallback();

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
  const defaultOutputValue = inscription ? inscription.outputValue : 10000;

  const [outputValue, setOutputValue] = useState(defaultOutputValue);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  const wallet = useWallet();
  useEffect(() => {
    wallet.getInscriptionUtxoDetail(inscription.inscriptionId).then((v) => {
      setInscriptions(v.inscriptions);
    });
  }, []);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

  const minOutputValue = useMemo(() => {
    if (toInfo.address) {
      return getAddressUtxoDust(toInfo.address);
    } else {
      return 0;
    }
  }, [toInfo.address]);

  useEffect(() => {
    setDisabled(true);
    setError('');

    if (feeRate <= 0) {
      setError(t('invalid_fee_rate'));
      return;
    }

    let dustUtxo = inscription.outputValue;
    try {
      if (toInfo.address) {
        dustUtxo = getAddressUtxoDust(toInfo.address);
      }
    } catch (e) {
      // console.log(e);
    }

    const maxOffset = inscriptions.reduce((pre, cur) => {
      return Math.max(pre, cur.offset);
    }, 0);

    const minOutputValue = Math.max(maxOffset + 1, dustUtxo);

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
      outputValue == ordinalsTx.outputValue &&
      enableRBF == ordinalsTx.enableRBF
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
  }, [toInfo, feeRate, outputValue, enableRBF, inscriptions]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('send_inscription2')}
      />
      <Content>
        <Column>
          <Text text={`${t('ordinals_inscriptions')} (${inscriptions.length})`} color="textDim" />
          <Row justifyBetween>
            <Row overflowX gap="md" pb="md">
              {inscriptions.map((v) => (
                <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
              ))}
            </Row>
          </Row>

          <Input
            preset="address"
            addressInputData={toInfo}
            autoFocus={true}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            recipientLabel={<Text text={t('recipient')} color="textDim" />}
          />

          {toInfo.address ? (
            <Column mt="lg">
              <Text text={t('output_value')} color="textDim" />

              <OutputValueBar
                defaultValue={Math.max(defaultOutputValue, 546)}
                minValue={minOutputValue}
                onChange={(val) => {
                  setOutputValue(val);
                }}
              />
            </Column>
          ) : null}

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
              navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
