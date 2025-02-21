import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_BBN_GAS_LIMIT, DEFAULT_BBN_GAS_PRICE } from '@/background/service/keyring/CosmosKeyring';
import { COSMOS_CHAINS_MAP } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { BabylonAddressSummary } from '@/shared/types';
import { Button, Card, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { isValidBech32Address, useWallet } from '@/ui/utils';

import { NotSupportedLayout } from './BabylonStakingScreen';

export default function SendBabyScreen() {
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(true);

  const [inputAmount, setInputAmount] = useState('');
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
  }>({
    address: '',
    domain: ''
  });

  const [error, setError] = useState('');

  const [memo, setMemo] = useState('');

  const babylonConfig = useBabylonConfig();
  if (!babylonConfig) {
    return <NotSupportedLayout />;
  }

  const babylonChainId = babylonConfig.chainId;

  const babylonChain = COSMOS_CHAINS_MAP[babylonChainId];

  const [babylonAddressSummary, setBabylonAddressSummary] = useState<BabylonAddressSummary>({
    address: '',
    balance: {
      denom: 'ubnb',
      amount: '0'
    },
    rewardBalance: 0,
    stakedBalance: 0
  });

  const wallet = useWallet();

  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    wallet
      .getBabylonAddressSummary(babylonChainId, false)
      .then((summary) => {
        setBabylonAddressSummary(summary);
      })
      .finally(() => {
        tools.showLoading(false);
      });
  }, []);

  const toValue = useMemo(() => {
    if (!inputAmount) return '0';
    return runesUtils.fromDecimalAmount(inputAmount, babylonChain.stakeCurrency.coinDecimals);
  }, [inputAmount]);

  const availableAmount = useMemo(() => {
    return runesUtils.toDecimalAmount(babylonAddressSummary.balance.amount, babylonChain.stakeCurrency.coinDecimals);
  }, [babylonAddressSummary.balance.amount]);

  const txFee = useMemo(() => {
    return runesUtils.toDecimalAmount(
      (parseFloat(DEFAULT_BBN_GAS_PRICE) * parseInt(DEFAULT_BBN_GAS_LIMIT)).toString(),
      babylonChain.feeCurrencies[0].coinDecimals
    );
  }, []);

  const toSpendValue = useMemo(() => {
    return Math.ceil(parseFloat(DEFAULT_BBN_GAS_PRICE) * parseInt(DEFAULT_BBN_GAS_LIMIT) + parseFloat(toValue));
  }, [toValue, txFee]);

  const maxAmount = useMemo(() => {
    return runesUtils.toDecimalAmount(
      Math.ceil(
        parseInt(babylonAddressSummary.balance.amount) -
          Math.ceil(parseFloat(DEFAULT_BBN_GAS_PRICE) * parseInt(DEFAULT_BBN_GAS_LIMIT))
      ).toString(),
      babylonChain.feeCurrencies[0].coinDecimals
    );
  }, [babylonAddressSummary.balance.amount]);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidBech32Address(toInfo.address)) {
      return;
    }
    if (!toValue || toValue == '0') {
      return;
    }

    if (runesUtils.compareAmount(toSpendValue.toString(), babylonAddressSummary.balance.amount) > 0) {
      setError('Amount exceeds your available balance');
      return;
    }

    if (memo.length > 256) {
      setError('Memo is too long. The maximum length is 256 characters.');
      return;
    }

    setDisabled(false);
  }, [toInfo, toValue, toSpendValue, memo]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={`Send ${babylonChain.stakeCurrency.coinDenom}`}
      />
      <Content style={{ padding: '0px 16px 24px' }}>
        <Row justifyCenter>
          <Icon icon="baby" size={50} />
        </Row>

        <Column mt="lg">
          <Text text="Recipient" preset="regular" />
          <Input
            preset="cosmosAddress"
            placeholder="bbn..."
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Transfer amount" preset="regular" />
          </Row>
          <Input
            preset="amount"
            placeholder={'Amount'}
            value={inputAmount}
            runesDecimal={babylonChain.stakeCurrency.coinDecimals}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            enableMax={true}
            onMaxClick={() => {
              setInputAmount(maxAmount);
            }}
          />

          <Card
            style={{
              flexDirection: 'column',
              borderRadius: 8
            }}
            gap="sm">
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 30
              }}>
              <Text text="Available" color="gold" />
              <Row justifyEnd>
                <Text text={`${availableAmount}`} size="sm" color="gold" />
                <Text text={babylonChain.stakeCurrency.coinDenom} size="sm" color="white" />
              </Row>
            </Row>
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 30
              }}>
              <Row />
              <Text text={babylonChain.chainName} size="sm" color="textDim" />
            </Row>
          </Card>
        </Column>

        <Column mt="lg">
          <Text text="Memo" preset="regular" />
          <Input
            placeholder={'Memo'}
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
            }}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Fee" />

            <Text text={`${txFee} ${babylonChain.feeCurrencies[0].coinDenom}`} color="white" />
          </Row>
        </Column>

        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text="Next"
          onClick={async (e) => {
            navigate('BabylonTxConfirmScreen', {
              txInfo: {
                toAddress: toInfo.address,
                balance: {
                  amount: inputAmount,
                  denom: babylonChain.stakeCurrency.coinDenom
                },
                unitBalance: {
                  amount: toValue,
                  denom: babylonChain.stakeCurrency.coinMinimalDenom
                },
                memo: memo,
                txFee: {
                  amount: txFee,
                  denom: babylonChain.stakeCurrency.coinDenom
                }
              }
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
