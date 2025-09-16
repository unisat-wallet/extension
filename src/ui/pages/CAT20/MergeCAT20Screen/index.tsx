import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressCAT20UtxoSummary, CAT20Balance, CAT20MergeOrder, CAT20TokenInfo, CAT_VERSION } from '@/shared/types';
import { Button, Card, Column, Content, Header, Input, Layout, Row, Slider, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { MergeBTCPopover } from '@/ui/components/MergeBTCPopover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount, showLongNumber, sleep, useLocationState, useWallet } from '@/ui/utils';

import { MergeProgressLayout } from './MergeProgressLayout';
import { ItemStatus, MergeItem, MergeState } from './MergingItem';
import { NoMergeLayout } from './NoMergeLayout';

interface LocationState {
  cat20Balance: CAT20Balance;
  cat20Info: CAT20TokenInfo;
  version: CAT_VERSION;
}

export default function MergeCAT20Screen() {
  const props = useLocationState<LocationState>();

  const { t } = useI18n();

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
        const data = await wallet.getAddressCAT20UtxoSummary(props.version, account.address, cat20Balance.tokenId);
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
        const step1Data = await wallet.transferCAT20Step1ByMerge(props.version, order.id);
        const step2Data = await wallet.transferCAT20Step2(
          props.version,
          step1Data.id,
          step1Data.commitTx,
          step1Data.toSignInputs
        );
        const step3Data = await wallet.transferCAT20Step3(
          props.version,
          step1Data.id,
          step2Data.revealTx,
          step2Data.toSignInputs
        );

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
        mergeItems[i].error = t('retry_in_10s');
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
      const order = await wallet.mergeCAT20Prepare(props.version, cat20Balance.tokenId, inputUtxoCount, feeRate);
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
        title={t('merge_utxos_for_cat20_asset')}
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
                text={t('this_feature_is_currently_in_the_experimental_test_phase_please_proceed_with_caution')}
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
            <Text text={t('set_utxo_amount_to_be_merged')} preset="regular" color="textDim" />
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
                      fontSize: 10,
                      lineHeight: '24px'
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

              <div 
                style={{ 
                  width: '100%', 
                  height: 1, 
                  backgroundColor: '#FFFFFF26', 
                  margin: '16px 0',
                  backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 5px, #FFFFFF26 5px, #FFFFFF26 10px)'
                }} 
              />

              <Row justifyBetween>
                <Text text={`${t('selected')} ${cat20Balance.symbol}`} color="textDim" size="sm" />
                <Row>
                  <Text text={`${estimatedData.amount} `} color="white" />
                  <Text text={`${cat20Balance.symbol} ${t('from')} ${inputUtxoCount} ${t('utxos')}`} color="textDim" />
                </Row>
              </Row>
              <Row justifyBetween>
                <Text text={t('merge_transactions')} preset="sub" />
                <Text text={estimatedData.batchCount} />
              </Row>
            </Column>
          </Card>
        </Column>

        <Column>
          <Text text={t('fee')} color="textDim" />

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
                <Text text={t('estimated_fee')} color="textDim" />
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
          text={t('start_merging')}
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
