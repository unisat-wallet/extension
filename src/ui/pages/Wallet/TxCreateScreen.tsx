import { Tooltip } from 'antd';
import { JSONRpcProvider } from 'opnet';
import { useEffect, useMemo, useState } from 'react';

import { COIN_DUST } from '@/shared/constant';
import { Account, RawTxInfo } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import {
  useBitcoinTx,
  useFetchUtxosCallback,
  usePrepareSendBTCCallback,
  useSafeBalance,
  useSpendUnavailableUtxos
} from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { fontSizes } from '@/ui/theme/font';
import { amountToSatoshis, isValidAddress, satoshisToAmount, useWallet } from '@/ui/utils';

export default function TxCreateScreen() {
  interface ItemData {
    key: string;
    account?: Account;
  }
  const accountBalance = useAccountBalance();
  const safeBalance = useSafeBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();

  const [disabled, setDisabled] = useState(true);

  const setUiState = useUpdateUiTxCreateScreen();
  const uiState = useUiTxCreateScreen();

  const toInfo = uiState.toInfo;
  const inputAmount = uiState.inputAmount;
  const enableRBF = uiState.enableRBF;
  const feeRate = uiState.feeRate;

  const [error, setError] = useState('');
  const [balanceValueRegtest, setBalanceValue] = useState<number>(0);
  const [OpnetRateInputVal, setOpnetRateInputVal] = useState<string>('0');
  const [autoAdjust, setAutoAdjust] = useState(false);
  const fetchUtxos = useFetchUtxosCallback();

  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);
  const keyring = useCurrentKeyring();

  const items = useMemo(() => {
    const _items: ItemData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
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
  const wallet = useWallet();
  const account = useCurrentAccount();
  const chain = useChain();

  useEffect(() => {
    const fetchBalance = async () => {
      if (chain.enum === 'BITCOIN_REGTEST') {
        const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');

        const btcbalanceGet = await provider.getBalance(account.address);
        setBalanceValue(parseInt(btcbalanceGet.toString()) / 10 ** 8);
      }
    };

    void fetchBalance();
  }, [chain.enum, account.address]);
  const unspendUnavailableAmount = satoshisToAmount(unavailableSatoshis - spendUnavailableSatoshis);
  useEffect(() => {
    const setWallet = async () => {
      Web3API.setNetwork(await wallet.getChainType());
    };
    setWallet();
  });
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
      setError(`Amount must be at least ${dustAmount} BTC`);
      return;
    }
    if (!(chain.enum === 'BITCOIN_REGTEST')) {
      if (toSatoshis > avaiableSatoshis + spendUnavailableSatoshis) {
        setError('Amount exceeds your available balance');
        return;
      }
    } else {
      if (toSatoshis / 10 ** 8 > balanceValueRegtest) {
        setError('Amount exceeds your available balance');
        return;
      }
    }

    if (feeRate <= 0) {
      return;
    }
    const runTransfer = async () => {
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
      if (!((await wallet.getNetworkType()) == 2)) {
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
      } else {
        setDisabled(false);
      }
    };
    runTransfer();
  }, [toInfo, inputAmount, feeRate, enableRBF]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Send BTC"
      />
      <Content style={{ padding: '0px 16px 24px' }}>
        <Row justifyCenter>
          <Icon icon="btc" size={50} />
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
              setUiState({
                inputAmount:
                  chain.enum == 'BITCOIN_REGTEST' ? balanceValueRegtest.toString() : totalAvailableAmount.toString()
              });
            }}
          />

          <Row justifyBetween>
            <Text text="Available" color="gold" />
            {chain.enum == 'BITCOIN_REGTEST' ? (
              <>
                {' '}
                <Row>
                  <Text text={`${balanceValueRegtest}`} size="sm" color="gold" />
                  <Text text={`BTC`} size="sm" color="textDim" />
                </Row>
              </>
            ) : (
              <>
                {' '}
                {spendUnavailableSatoshis > 0 && (
                  <Row>
                    <Text text={`${spendUnavailableAmount}`} size="sm" style={{ color: '#65D5F0' }} />
                    <Text text={`BTC`} size="sm" color="textDim" />
                    <Text text={`+`} size="sm" color="textDim" />
                  </Row>
                )}
                <Row>
                  <Text text={`${avaiableAmount}`} size="sm" color="gold" />
                  <Text text={`BTC`} size="sm" color="textDim" />
                </Row>
              </>
            )}
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
                <Text text={`BTC`} size="sm" color="textDim" />
              </Row>
            ) : (
              <Row>
                <Text text={`${unavailableAmount}`} size="sm" color="textDim" />
                <Text text={`BTC`} size="sm" color="textDim" />
              </Row>
            )}
          </Row>

          <Row justifyBetween>
            <Text text="Total" color="textDim" />
            <Row>
              <Text
                text={`${chain.enum == 'BITCOIN_REGTEST' ? balanceValueRegtest : totalAmount}`}
                size="sm"
                color="textDim"
              />
              <Text text={`BTC`} size="sm" color="textDim" />
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
        {chain.enum == 'BITCOIN_REGTEST' && (
          <>
            {' '}
            <Text text="Opnet Fee" color="textDim" />
            <Input
              preset="amount"
              placeholder={'sat/vB'}
              value={OpnetRateInputVal}
              onAmountInputChange={(amount) => {
                setOpnetRateInputVal(amount);
              }}
              // onBlur={() => {
              //   const val = parseInt(feeRateInputVal) + '';
              //   setFeeRateInputVal(val);
              // }}
              autoFocus={true}
            />
          </>
        )}

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
            if (!(chain.enum == 'BITCOIN_REGTEST')) {
              navigate('TxConfirmScreen', { rawTxInfo });
            } else {
              navigate('TxOpnetConfirmScreen', {
                rawTxInfo: {
                  items: items,
                  contractAddress: 'BTC',
                  account: account,
                  inputAmount: inputAmount,
                  address: toInfo.address,
                  feeRate: feeRate, // replace with actual feeRate
                  OpnetRateInputVal: OpnetRateInputVal, // replace with actual OpnetRateInputVal
                  header: 'Send BTC', // replace with actual header
                  networkFee: feeRate, // replace with actual networkFee
                  features: {
                    rbf: false // replace with actual rbf value
                  },
                  inputInfos: [], // replace with actual inputInfos
                  isToSign: false, // replace with actual isToSign value
                  opneTokens: [
                    {
                      amount: parseFloat(inputAmount) * 10 ** 8,
                      divisibility: 8,
                      spacedRune: 'Bitcoin',
                      symbol: 'BTC'
                    }
                  ],
                  action: 'sendBTC' // replace with actual opneTokens
                }
              });
            }
          }}></Button>
      </Content>
    </Layout>
  );
}
