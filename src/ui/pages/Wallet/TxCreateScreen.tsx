import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { COIN_DUST } from '@/shared/constant';
import { RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import {
  useBitcoinTx,
  useFetchUtxosCallback,
  usePrepareSendBTCCallback,
  useSafeBalance,
  useSpendUnavailableUtxos
} from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { fontSizes } from '@/ui/theme/font';
import { amountToSatoshis, isValidAddress, satoshisToAmount } from '@/ui/utils';

export default function TxCreateScreen() {
  const accountBalance = useAccountBalance();
  const safeBalance = useSafeBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const btcUnit = useBTCUnit();

  const [disabled, setDisabled] = useState(true);

  const setUiState = useUpdateUiTxCreateScreen();
  const uiState = useUiTxCreateScreen();

  const toInfo = uiState.toInfo;
  const inputAmount = uiState.inputAmount;
  const enableRBF = uiState.enableRBF;
  const feeRate = uiState.feeRate;

  const [error, setError] = useState('');

  const [autoAdjust, setAutoAdjust] = useState(false);
  const fetchUtxos = useFetchUtxosCallback();

  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const prepareSendBTC = usePrepareSendBTCCallback();

  const avaiableSatoshis = useMemo(() => {
    return amountToSatoshis(safeBalance);
  }, [safeBalance]);

  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSatoshis(inputAmount);
  }, [inputAmount]);

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

  const spendUnavailableUtxos = useSpendUnavailableUtxos();
  const spendUnavailableSatoshis = useMemo(() => {
    return spendUnavailableUtxos.reduce((acc, cur) => {
      return acc + cur.satoshis;
    }, 0);
  }, [spendUnavailableUtxos]);
  const spendUnavailableAmount = satoshisToAmount(spendUnavailableSatoshis);

  const totalAvailableSatoshis = avaiableSatoshis + spendUnavailableSatoshis;
  const totalAvailableAmount = satoshisToAmount(totalAvailableSatoshis);

  const totalSatoshis = amountToSatoshis(accountBalance.amount);
  const unavailableSatoshis = totalSatoshis - avaiableSatoshis;

  const avaiableAmount = safeBalance;
  const unavailableAmount = satoshisToAmount(unavailableSatoshis);
  const totalAmount = accountBalance.amount;

  const unspendUnavailableAmount = satoshisToAmount(unavailableSatoshis - spendUnavailableSatoshis);

  const chain = useChain();
  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }
    if (!toSatoshis) {
      return;
    }
    if (toSatoshis < COIN_DUST) {
      setError(`Amount must be at least ${dustAmount} ${btcUnit}`);
      return;
    }

    if (toSatoshis > avaiableSatoshis + spendUnavailableSatoshis) {
      setError('Amount exceeds your available balance');
      return;
    }

    if (feeRate <= 0) {
      return;
    }

    if (
      toInfo.address == bitcoinTx.toAddress &&
      toSatoshis == bitcoinTx.toSatoshis &&
      feeRate == bitcoinTx.feeRate &&
      enableRBF == bitcoinTx.enableRBF
    ) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    prepareSendBTC({ toAddressInfo: toInfo, toAmount: toSatoshis, feeRate, enableRBF })
      .then((data) => {
        // if (data.fee < data.estimateFee) {
        //   setError(`Network fee must be at leat ${data.estimateFee}`);
        //   return;
        // }
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toInfo, inputAmount, feeRate, enableRBF]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={`Send ${btcUnit}`}
      />
      <Content style={{ padding: '0px 16px 24px' }}>
        <Row justifyCenter>
          <Image src={chain.icon} size={50} />
        </Row>

        <Column mt="lg">
          <Text text="Recipient" preset="regular" color="textDim" />
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setUiState({ toInfo: val });
            }}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Transfer amount" preset="regular" color="textDim" />
            <BtcUsd sats={toSatoshis} />
          </Row>
          <Input
            preset="amount"
            placeholder={'Amount'}
            value={inputAmount}
            onAmountInputChange={(amount) => {
              if (autoAdjust == true) {
                setAutoAdjust(false);
              }
              setUiState({ inputAmount: amount });
            }}
            enableMax={true}
            onMaxClick={() => {
              setAutoAdjust(true);
              setUiState({ inputAmount: totalAvailableAmount.toString() });
            }}
          />

          <Row justifyBetween>
            <Text text="Available" color="gold" />
            {spendUnavailableSatoshis > 0 && (
              <Row>
                <Text text={`${spendUnavailableAmount}`} size="sm" style={{ color: '#65D5F0' }} />
                <Text text={btcUnit} size="sm" color="textDim" />
                <Text text={`+`} size="sm" color="textDim" />
              </Row>
            )}

            <Row>
              <Text text={`${avaiableAmount}`} size="sm" color="gold" />
              <Text text={btcUnit} size="sm" color="textDim" />
            </Row>
          </Row>

          <Row justifyBetween>
            <Tooltip
              title={`Includes Inscriptions, ARC20, Runes, and unconfirmed UTXO assets. Future versions will support spending these assets.`}
              overlayStyle={{
                fontSize: fontSizes.xs
              }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Row itemsCenter>
                  <Text
                    text="Unavailable"
                    // text="Unavailable >"
                    color="textDim"
                    // onClick={() => {
                    //   navigate('UnavailableUtxoScreen');
                    // }}
                  />

                  <Icon icon="circle-question" color="textDim" />
                </Row>
              </div>
            </Tooltip>

            {spendUnavailableSatoshis > 0 ? (
              <Row>
                <Text text={`${unspendUnavailableAmount}`} size="sm" color="textDim" />
                <Text text={btcUnit} size="sm" color="textDim" />
              </Row>
            ) : (
              <Row>
                <Text text={`${unavailableAmount}`} size="sm" color="textDim" />
                <Text text={btcUnit} size="sm" color="textDim" />
              </Row>
            )}
          </Row>

          <Row justifyBetween>
            <Text text="Total" color="textDim" />
            <Row>
              <Text text={`${totalAmount}`} size="sm" color="textDim" />
              <Text text={btcUnit} size="sm" color="textDim" />
            </Row>
          </Row>
        </Column>

        <Column mt="lg">
          <Text text="Fee" color="textDim" />

          <FeeRateBar
            onChange={(val) => {
              setUiState({ feeRate: val });
            }}
          />
        </Column>

        <Column mt="lg">
          <RBFBar
            defaultValue={enableRBF}
            onChange={(val) => {
              setUiState({ enableRBF: val });
            }}
          />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text="Next"
          onClick={(e) => {
            navigate('TxConfirmScreen', { rawTxInfo });
          }}></Button>
      </Content>
    </Layout>
  );
}
