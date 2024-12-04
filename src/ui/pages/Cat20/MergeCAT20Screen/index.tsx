import { Divider, Slider } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressCAT20UtxoSummary, CAT20Balance, CAT20MergeOrder, CAT20TokenInfo } from '@/shared/types';
import { Button, Card, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { MergeBTCPopover } from '@/ui/components/MergeBTCPopover';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount, showLongNumber, sleep, useWallet } from '@/ui/utils';

import { MergeProgressLayout } from './MergeProgressLayout';
import { ItemStatus, MergeItem, MergeState } from './MergingItem';
import { NoMergeLayout } from './NoMergeLayout';

export default function MergeCAT20Screen() {
  const { state } = useLocation();
  const props = state as {
    cat20Balance: CAT20Balance;
    cat20Info: CAT20TokenInfo;
  };

  const cat20Balance = props.cat20Balance;

  const cat20Info = props.cat20Info;

  const wallet = useWallet();

  const [disabled, setDisabled] = useState(false);

  const [mergeOrder, setMergeOrder] = useState<CAT20MergeOrder | null>();

  const [tokenUtxoSummary, setTokenUtxoSummary] = useState<AddressCAT20UtxoSummary>({
    availableTokenAmounts: [],
    availableUtxoCount: 0,
    totalUtxoCount: 0
  });

  const minUtxoCount = useMemo(() => {
    return Math.min(tokenUtxoSummary.availableUtxoCount, 2);
  }, [tokenUtxoSummary.availableUtxoCount]);

  const maxUtxoCount = tokenUtxoSummary.availableUtxoCount;

  const minTokenAmount = useMemo(() => {
    let amount = new BigNumber(0);
    for (let i = 0; i < minUtxoCount; i++) {
      amount = amount.plus(BigNumber(tokenUtxoSummary.availableTokenAmounts[i]));
    }
    return runesUtils.toDecimalAmount(amount.toString(), cat20Balance.decimals);
  }, [minUtxoCount, tokenUtxoSummary]);

  const maxTokenAmount = useMemo(() => {
    let amount = new BigNumber(0);
    for (let i = 0; i < maxUtxoCount; i++) {
      amount = amount.plus(BigNumber(tokenUtxoSummary.availableTokenAmounts[i]));
    }
    return runesUtils.toDecimalAmount(amount.toString(), cat20Balance.decimals);
  }, [maxUtxoCount, tokenUtxoSummary]);

  const [error, setError] = useState('');

  const account = useCurrentAccount();

  const tools = useTools();

  useEffect(() => {
    async function init() {
      tools.showLoading(true);
      try {
        const data = await wallet.getAddressCAT20UtxoSummary(account.address, cat20Balance.tokenId);
        setTokenUtxoSummary(data);
        if (data.availableUtxoCount < 2) {
          setDisabled(true);
        }
      } catch (e) {
        console.log(e);
        setError((e as any).message);
      } finally {
        tools.showLoading(false);
      }
    }
    init();
  }, []);

  const [feeRate, setFeeRate] = useState(5);

  const [inputUtxoCount, setInputUtxoCount] = useState(2);

  const [textInputUtxoValue, setTextInputUtxoValue] = useState('2');
  useEffect(() => {
    setTextInputUtxoValue(inputUtxoCount.toString());
  }, [inputUtxoCount]);

  const [estimatedData, setEstimatedData] = useState({
    fee: 0,
    batchCount: 0,
    amount: '0'
  });
  useEffect(() => {
    setError('');
    setDisabled(true);
    setEstimatedData({
      fee: 0,
      batchCount: 0,
      amount: '0'
    });

    const each_virtual_size = 7819;
    let initAmount = BigNumber(0);
    const utxoCount = Math.min(inputUtxoCount, tokenUtxoSummary.availableTokenAmounts.length);
    for (let i = 0; i < inputUtxoCount; i++) {
      const tokenAmount = tokenUtxoSummary.availableTokenAmounts[i];
      initAmount = initAmount.plus(tokenAmount);
    }

    let batchCount = 0;
    if (utxoCount <= 1) {
      batchCount = 0;
    } else if (utxoCount > 1 && utxoCount <= 4) {
      batchCount = 1;
    } else {
      batchCount = Math.ceil((utxoCount - 4) / 3) + 1;
    }
    const fee = each_virtual_size * feeRate * batchCount;

    setEstimatedData({
      fee,
      batchCount,
      amount: runesUtils.toDecimalAmount(initAmount.toString(), cat20Balance.decimals)
    });

    setDisabled(false);
  }, [inputUtxoCount, tokenUtxoSummary, feeRate]);

  const btcUnit = useBTCUnit();

  const [mergeState, setMergeState] = useState<MergeState>(MergeState.None);
  const [mergeItems, setMergeItems] = useState<MergeItem[]>([]);

  const [showMergeBTCUTXOPopover, setShowMergeBTCUTXOPopover] = useState(false);

  const onContinue = async () => {
    setMergeState(MergeState.Running);
    if (!mergeOrder) {
      return;
    }

    const order = mergeOrder;
    let i = 0;
    let failedCount = 0;
    for (i = order.batchIndex; i < order.batchCount; i++) {
      try {
        const step1Data = await wallet.transferCAT20Step1ByMerge(order.id);
        const step2Data = await wallet.transferCAT20Step2(step1Data.id, step1Data.commitTx, step1Data.toSignInputs);
        const step3Data = await wallet.transferCAT20Step3(step1Data.id, step2Data.revealTx, step2Data.toSignInputs);

        mergeItems[i].status = ItemStatus.completed;
        mergeItems[i].txid = step3Data.txid;
        mergeItems[i].error = '';
        mergeItems[i].feeRate = step1Data.feeRate;

        order.batchIndex = i + 1;

        setMergeOrder(order);
        setMergeItems(mergeItems.map((v) => v));

        if (i < order.batchCount - 1) {
          await sleep(5);
        }
      } catch (e) {
        if (failedCount > 20) {
          setMergeState(MergeState.Paused);
          return;
        }

        mergeItems[i].status = ItemStatus.dealing;
        mergeItems[i].error = 'Retry in 10s';
        failedCount += 1;

        setMergeItems(mergeItems.map((v) => v));

        i = i - 1;

        await sleep(10);
      }
    }

    setMergeState(MergeState.Done);
  };

  const onPrepare = async () => {
    tools.showLoading(true);
    try {
      const order = await wallet.mergeCAT20Prepare(cat20Balance.tokenId, inputUtxoCount, feeRate);
      if (order) {
        setMergeOrder(order);
      }
      tools.showLoading(false);

      const arr: MergeItem[] = [];
      for (let i = 0; i < order.batchCount; i++) {
        arr.push({
          index: i,
          status: ItemStatus.pending,
          txid: '',
          error: ''
        });
      }
      setMergeItems(arr);
      setMergeState(MergeState.Prepare);
    } catch (e) {
      const msg = (e as any).message;
      if (msg.includes('-307')) {
        setShowMergeBTCUTXOPopover(true);
        return;
      }
      tools.toastError((e as any).message);
    } finally {
      tools.showLoading(false);
    }
  };

  if (tokenUtxoSummary.availableUtxoCount < 2) {
    return <NoMergeLayout cat20Balance={cat20Balance} tokenUtxoSummary={tokenUtxoSummary} />;
  }

  if (mergeOrder) {
    return (
      <MergeProgressLayout
        mergeOrder={mergeOrder}
        mergeItems={mergeItems}
        mergeState={mergeState}
        onContinue={onContinue}
      />
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Merge UTXOs for CAT20 Asset"
      />
      <Content>
        <Column>
          <Column
            style={{
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#F4B62C59',
              backgroundColor: 'rgba(244, 182, 44, 0.08)'
            }}>
            <Column mx="md" my="md">
              <Text
                text={'This feature is currently in the experimental test phase. Please proceed with caution.'}
                size="xs"
                color="warning_content"
              />
            </Column>
          </Column>

          <Row justifyCenter itemsCenter>
            <Text
              text={`${showLongNumber(runesUtils.toDecimalAmount(cat20Balance.amount, cat20Balance.decimals))} `}
              preset="bold"
              color="white"
              textCenter
              size="xxl"
              wrap
            />

            <BRC20Ticker tick={cat20Info.symbol} preset="lg" />
          </Row>

          <Row justifyCenter>
            <Text
              text={`${tokenUtxoSummary.totalUtxoCount} UTXOs`}
              preset="bold"
              color="orange"
              textCenter
              size="md"
              wrap
            />
          </Row>

          <Row itemsCenter>
            <Text text={`set UTXO amount to be merged`} preset="regular" color="textDim" />
          </Row>
        </Column>

        <Column>
          <Card>
            <Column fullX>
              <Row justifyBetween itemsCenter>
                <Text text={'UTXOs'} preset="sub" />

                <Row style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 5 }}>
                  <Input
                    containerStyle={{
                      width: 40,
                      height: 24,
                      padding: 2,
                      minHeight: 24
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      fontSize: 10
                    }}
                    preset="amount"
                    value={textInputUtxoValue}
                    disableDecimal
                    placeholder=""
                    onBlur={() => {
                      const nAmount = parseInt(textInputUtxoValue) || 0;
                      if (nAmount < minUtxoCount) {
                        setTextInputUtxoValue(minUtxoCount.toString());
                        setInputUtxoCount(minUtxoCount);
                        return;
                      }

                      if (nAmount > maxUtxoCount) {
                        setTextInputUtxoValue(maxUtxoCount.toString());
                        setInputUtxoCount(maxUtxoCount);
                        return;
                      }
                      setInputUtxoCount(nAmount);
                    }}
                    onAmountInputChange={(amount) => {
                      setTextInputUtxoValue(amount);
                    }}
                  />
                </Row>
              </Row>

              <Slider
                defaultValue={inputUtxoCount}
                min={minUtxoCount}
                max={maxUtxoCount}
                value={inputUtxoCount}
                onChange={(val) => {
                  setInputUtxoCount(val);
                }}
              />

              <Row justifyBetween itemsCenter>
                <Text text={minUtxoCount} preset="sub" />
                <Text
                  text={`${minTokenAmount} ${cat20Balance.symbol} ~ ${maxTokenAmount} ${cat20Balance.symbol} `}
                  preset="sub"
                />
                <Text text={maxUtxoCount} preset="sub" />
              </Row>

              <Divider style={{ borderColor: '#FFFFFF26', borderWidth: 1 }} dashed></Divider>

              <Row justifyBetween>
                <Text text={`Selected ${cat20Balance.symbol}`} color="textDim" size="sm" />
                <Row>
                  <Text text={`${estimatedData.amount} `} color="white" />
                  <Text text={`${cat20Balance.symbol} from ${inputUtxoCount} UTXOs`} color="textDim" />
                </Row>
              </Row>
              <Row justifyBetween>
                <Text text={'Merge Transactions'} preset="sub" />
                <Text text={estimatedData.batchCount} />
              </Row>
            </Column>
          </Card>
        </Column>

        <Column>
          <Text text="Fee" color="textDim" />

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />
        </Column>

        {error && <Text text={error} color="error" />}

        <Column>
          <Card>
            <Column fullX>
              <Row justifyBetween>
                <Text text="Estimated Fee" color="textDim" />
                <Row itemsCenter>
                  <Text text={estimatedData.fee ? `${satoshisToAmount(estimatedData.fee)}` : '--'} />
                  <Text text={btcUnit} preset="sub" />
                </Row>
              </Row>
              <Row justifyBetween>
                <Text />
                <BtcUsd sats={estimatedData.fee} />
              </Row>
            </Column>
          </Card>
        </Column>
        <Button
          disabled={disabled}
          preset="primary"
          text="Start Merging"
          onClick={(e) => {
            onPrepare();
          }}></Button>

        {showMergeBTCUTXOPopover && (
          <MergeBTCPopover
            onClose={() => {
              setShowMergeBTCUTXOPopover(false);
            }}
          />
        )}
      </Content>
    </Layout>
  );
}
