import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ChainType, COIN_DUST } from '@/shared/constant';
import { RawTxInfo } from '@/shared/types';
import { Button, Card, Column, Content, Header, Icon, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain, useWalletConfig } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useFetchUtxosCallback, usePrepareSendBTCCallback } from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { amountToSatoshis, isValidAddress, satoshisToAmount } from '@/ui/utils';

export default function TxCreateScreen() {
  const accountBalance = useAccountBalance();
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

  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSatoshis(inputAmount);
  }, [inputAmount]);

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

  const availableAmount = satoshisToAmount(accountBalance.availableBalance);
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);

  const showUnavailable = accountBalance.unavailableBalance > 0;

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

    if (toSatoshis > accountBalance.availableBalance) {
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

  const walletConfig = useWalletConfig();

  const unavailableTipText = useMemo(() => {
    let tipText = '';
    if (chain.enum === ChainType.BITCOIN_MAINNET) {
      tipText += `Includes Inscriptions, ARC20, Runes, and unconfirmed UTXO assets.`;
    } else {
      tipText += `Includes Inscriptions, Runes, and unconfirmed UTXO assets.`;
    }

    if (walletConfig.disableUtxoTools) {
      tipText += ` Future versions will support spending these assets.`;
    } else {
      tipText += ` You can unlock these assets by using the UTXO tools.`;
    }
    return tipText;
  }, [chain.enum]);

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
          <Text text="Recipient" preset="regular" />
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
            <Text text="Transfer amount" preset="regular" />
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
              setUiState({ inputAmount: availableAmount.toString() });
            }}
          />

          <Card
            style={{
              flexDirection: 'column',
              borderRadius: 8
            }}>
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 30
              }}>
              <Text text="Available" color="gold" />
              <Row>
                <Text text={`${availableAmount}`} size="sm" color="gold" />
                <Text text={btcUnit} size="sm" color="textDim" />
              </Row>
            </Row>

            {showUnavailable ? (
              <Row
                style={{
                  width: '100%',
                  border: '1px dashed',
                  borderColor: colors.line
                }}></Row>
            ) : null}

            {showUnavailable ? (
              <Row
                justifyBetween
                fullX
                itemsCenter
                style={{
                  minHeight: 30
                }}>
                <Tooltip
                  title={unavailableTipText}
                  overlayStyle={{
                    fontSize: fontSizes.xs
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Row itemsCenter>
                      <Text text="Unavailable" />
                      <Icon icon="circle-question" color="textDim" />
                    </Row>
                  </div>
                </Tooltip>

                <Row itemsCenter>
                  <Row>
                    <Text text={`${unavailableAmount}`} size="sm" />
                    <Text text={btcUnit} size="sm" color="textDim" />
                  </Row>
                  {walletConfig.disableUtxoTools ? null : (
                    <Button
                      preset="minimal"
                      text="Unlock"
                      onClick={() => {
                        window.open(`${chain.unisatUrl}/utils/utxo`);
                      }}
                    />
                  )}
                </Row>
              </Row>
            ) : null}
          </Card>
        </Column>

        <Column mt="lg">
          <Text text="Fee" />

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
