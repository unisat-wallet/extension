import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_BBN_GAS_LIMIT } from '@/background/service/keyring/CosmosKeyring';
import { COSMOS_CHAINS_MAP } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { BabylonAddressSummary } from '@/shared/types';
import { Button, Card, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { FeeOptionsPopover } from '@/ui/components/FeeOptionsPopover';
import { FeeSettings } from '@/ui/components/FeeOptionsPopover/interface';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAppDispatch, useAppSelector } from '@/ui/state/hooks';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { NavigationSource, uiActions } from '@/ui/state/ui/reducer';
import { isValidBech32Address, useWallet } from '@/ui/utils';

import { NotSupportedLayout } from './BabylonStakingScreen';

const BABYLON_FEE_SETTINGS_KEY = 'babylonFeeSettings';

export default function SendBabyScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const hasInitializedRef = useRef(false);
  const { t } = useI18n();

  let savedBabylonState;
  const navigationSource = useAppSelector((state) => state.ui.navigationSource);
  if (navigationSource === NavigationSource.BACK) {
    savedBabylonState = useAppSelector((state) => state.ui.babylonSendScreen);
  } else {
    savedBabylonState = {
      inputAmount: '',
      memo: ''
    };
  }

  const [disabled, setDisabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [inputAmount, setInputAmount] = useState(savedBabylonState.inputAmount);
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
  }>({
    address: '',
    domain: ''
  });

  const [error, setError] = useState('');

  const [memo, setMemo] = useState(savedBabylonState.memo);

  const [feeOptionVisible, setFeeOptionVisible] = useState(false);

  const babylonConfig = useBabylonConfig();
  if (!babylonConfig) {
    return <NotSupportedLayout />;
  }

  const babylonChainId = babylonConfig.chainId;
  const babylonChain = COSMOS_CHAINS_MAP[babylonChainId];

  const updateReduxState = () => {
    dispatch(
      uiActions.updateBabylonSendScreen({
        inputAmount,
        memo
      })
    );
  };

  const clearReduxState = () => {
    dispatch(uiActions.resetBabylonSendScreen());
    dispatch(uiActions.setNavigationSource(NavigationSource.NORMAL));
  };

  const loadSavedFeeSettings = () => {
    try {
      const savedSettings = localStorage.getItem(BABYLON_FEE_SETTINGS_KEY);
      return savedSettings ? JSON.parse(savedSettings) : null;
    } catch (error) {
      console.error('Error loading saved fee settings:', error);
      return null;
    }
  };

  const [feeSettings, setFeeSettings] = useState<FeeSettings>(() => {
    const savedSettings = loadSavedFeeSettings();
    if (savedSettings && savedSettings.rememberChoice) {
      return {
        selectedOption: savedSettings.selectedOption ?? 1,
        rememberChoice: savedSettings.rememberChoice ?? false,
        selectedCurrency: savedSettings.selectedCurrency ?? babylonChain.feeCurrencies[0].coinDenom,
        gasAdjustment: 1.3,
        gasLimit: parseInt(DEFAULT_BBN_GAS_LIMIT),
        isAutoGasLimit: true,
        currentFeeDisplay: undefined
      };
    } else {
      return {
        selectedOption: 1,
        rememberChoice: false,
        selectedCurrency: babylonChain.feeCurrencies[0].coinDenom,
        gasAdjustment: 1.3,
        gasLimit: parseInt(DEFAULT_BBN_GAS_LIMIT),
        isAutoGasLimit: true,
        currentFeeDisplay: undefined
      };
    }
  });

  const gasLimitValue = feeSettings.gasLimit || parseInt(DEFAULT_BBN_GAS_LIMIT);

  const handleFeeSettingsChange = (newSettings: Partial<FeeSettings>) => {
    setFeeSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings };

      if (updatedSettings.rememberChoice) {
        const settingsToSave = {
          rememberChoice: true,
          selectedOption: updatedSettings.selectedOption,
          selectedCurrency: updatedSettings.selectedCurrency
        };
        localStorage.setItem(BABYLON_FEE_SETTINGS_KEY, JSON.stringify(settingsToSave));
      } else if (newSettings.rememberChoice === false) {
        localStorage.removeItem(BABYLON_FEE_SETTINGS_KEY);
      }

      return updatedSettings;
    });
  };

  const [babylonAddressSummary, setBabylonAddressSummary] = useState<BabylonAddressSummary>({
    address: '',
    balance: {
      denom: 'ubnb',
      amount: '0'
    },
    rewardBalance: 0,
    stakedBalance: 0
  });

  const feeOptions = useMemo(() => {
    const { low, average, high } = babylonChain.feeCurrencies[0].gasPriceStep;
    return [
      { title: t('low'), gasPrice: low },
      { title: t('medium'), gasPrice: average },
      { title: t('high'), gasPrice: high }
    ];
  }, [babylonChain]);

  const updateCurrentFeeDisplay = useCallback(
    (gasLimit: number) => {
      const selectedOption = feeOptions[feeSettings.selectedOption];
      const gasPrice = selectedOption.gasPrice;

      const fee = Math.ceil(parseFloat(gasPrice.toString()) * gasLimit * (feeSettings.gasAdjustment || 1.3));

      const formattedFee = runesUtils.toDecimalAmount(fee.toString(), babylonChain.feeCurrencies[0].coinDecimals);
      // Always display 6 decimal places
      const limitedFee = parseFloat(formattedFee).toFixed(6);

      handleFeeSettingsChange({
        currentFeeDisplay: limitedFee,
        gasLimit: gasLimit
      });
    },
    [
      feeOptions,
      feeSettings.selectedOption,
      feeSettings.gasAdjustment,
      handleFeeSettingsChange,
      babylonChain.feeCurrencies
    ]
  );

  const simulateTransaction = useCallback(async () => {
    if (!babylonConfig || isSimulating) return;

    if (!toInfo.address || !isValidBech32Address(toInfo.address) || !inputAmount || inputAmount === '0') {
      return;
    }

    const simulationAmount = inputAmount;
    const simulationValue = runesUtils.fromDecimalAmount(simulationAmount, babylonChain.stakeCurrency.coinDecimals);
    setIsSimulating(true);
    try {
      const simulatedGas = await wallet.simulateBabylonGas(
        babylonChainId,
        toInfo.address,
        {
          amount: simulationValue,
          denom: babylonChain.stakeCurrency.coinMinimalDenom
        },
        memo
      );

      if (simulatedGas) {
        const newGasLimit = Math.ceil(simulatedGas * 2);
        updateCurrentFeeDisplay(newGasLimit);
      }
    } catch (error) {
      console.error('Error simulating transaction:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [
    babylonConfig,
    babylonChainId,
    babylonChain,
    wallet,
    inputAmount,
    toInfo.address,
    memo,
    isSimulating,
    updateCurrentFeeDisplay
  ]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const loadData = async () => {
      try {
        const summary = await wallet.getBabylonAddressSummary(babylonChainId);
        setBabylonAddressSummary(summary);

        if (!isSimulating) {
          simulateTransaction();
        }
      } catch (e) {
        console.error('Error loading address summary:', e);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadData();
  }, [babylonChainId, wallet]);

  const [shouldRecalculate, setShouldRecalculate] = useState(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      setShouldRecalculate(true);
    }
  }, [inputAmount, memo, toInfo.address]);

  useEffect(() => {
    if (shouldRecalculate && !isSimulating && !summaryLoading) {
      const timer = setTimeout(() => {
        simulateTransaction();
        setShouldRecalculate(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldRecalculate, isSimulating, summaryLoading, simulateTransaction]);

  const currentGasPrice = useMemo(() => {
    return feeOptions[feeSettings.selectedOption].gasPrice.toString();
  }, [feeOptions, feeSettings.selectedOption]);

  const toValue = useMemo(() => {
    if (!inputAmount) return '0';
    return runesUtils.fromDecimalAmount(inputAmount, babylonChain.stakeCurrency.coinDecimals);
  }, [inputAmount, babylonChain.stakeCurrency.coinDecimals]);

  const availableAmount = useMemo(() => {
    return runesUtils.toDecimalAmount(babylonAddressSummary.balance.amount, babylonChain.stakeCurrency.coinDecimals);
  }, [babylonAddressSummary.balance.amount, babylonChain.stakeCurrency.coinDecimals]);

  const txFee = useMemo(() => {
    if (feeSettings.currentFeeDisplay) {
      return feeSettings.currentFeeDisplay;
    }

    const fee = Math.ceil(parseFloat(currentGasPrice) * gasLimitValue * (feeSettings.gasAdjustment || 1.3));
    const rawFee = runesUtils.toDecimalAmount(fee.toString(), babylonChain.feeCurrencies[0].coinDecimals);
    // Always display 6 decimal places
    return parseFloat(rawFee).toFixed(6);
  }, [
    feeSettings.currentFeeDisplay,
    currentGasPrice,
    gasLimitValue,
    feeSettings.gasAdjustment,
    babylonChain.feeCurrencies
  ]);

  const toSpendValue = useMemo(() => {
    const gasFee = Math.ceil(parseFloat(currentGasPrice) * gasLimitValue * (feeSettings.gasAdjustment || 1.3));
    return gasFee + parseFloat(toValue);
  }, [toValue, currentGasPrice, gasLimitValue, feeSettings.gasAdjustment]);

  const maxAmount = useMemo(() => {
    const gasFee = Math.ceil(parseFloat(currentGasPrice) * gasLimitValue * (feeSettings.gasAdjustment || 1.3));
    const maxAvailable = parseInt(babylonAddressSummary.balance.amount) - gasFee;

    return runesUtils.toDecimalAmount(Math.max(0, maxAvailable).toString(), babylonChain.stakeCurrency.coinDecimals);
  }, [
    babylonAddressSummary.balance.amount,
    currentGasPrice,
    gasLimitValue,
    feeSettings.gasAdjustment,
    babylonChain.stakeCurrency.coinDecimals
  ]);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidBech32Address(toInfo.address)) {
      return;
    }

    if (toInfo.address.indexOf('bbn') !== 0) {
      setError(t('invalid_recipient_address'));
      return;
    }

    if (!toValue || toValue == '0') {
      return;
    }

    if (runesUtils.compareAmount(toSpendValue.toString(), babylonAddressSummary.balance.amount) > 0) {
      // Check if this is due to newly received tokens
      const inputValueInMinimalDenom = runesUtils.fromDecimalAmount(
        inputAmount,
        babylonChain.stakeCurrency.coinDecimals
      );

      // If the input amount is less than or equal to the available balance,
      // but the toSpendValue (which includes gas) exceeds the balance,
      // it's likely due to newly received tokens not being included in gas calculation
      if (runesUtils.compareAmount(inputValueInMinimalDenom, babylonAddressSummary.balance.amount) <= 0) {
        setError(t('gas_fee_calculation_may_not_include_newly_received_tokens_try_a_smaller_amount'));
      } else {
        setError(t('amount_exceeds_your_available_balance'));
      }
      return;
    }

    if (memo.length > 256) {
      setError(t('memo_is_too_long_the_maximum_length_is_256_characters'));
      return;
    }

    if (isSimulating || summaryLoading) {
      return;
    }

    setDisabled(false);
  }, [
    toInfo,
    toValue,
    toSpendValue,
    memo,
    babylonAddressSummary.balance.amount,
    isSimulating,
    summaryLoading,
    inputAmount,
    babylonChain.stakeCurrency.coinDecimals
  ]);

  const prepareTxInfo = () => ({
    toAddress: toInfo.address,
    balance: {
      amount: inputAmount,
      denom: babylonChain.stakeCurrency.coinDenom
    },
    unitBalance: {
      amount: toValue,
      denom: babylonChain.stakeCurrency.coinMinimalDenom
    },
    memo,
    txFee: {
      amount: txFee,
      denom: babylonChain.feeCurrencies[0].coinDenom
    },
    gasLimit: gasLimitValue,
    gasPrice: currentGasPrice,
    gasAdjustment: feeSettings.gasAdjustment || 1.3
  });

  return (
    <Layout>
      <Header
        onBack={() => {
          clearReduxState();
          navigate('BabylonStakingScreen');
        }}
        title={`${t('send')} ${babylonChain.stakeCurrency.coinDenom}`}
      />
      <Content style={{ padding: '0px 16px 16px' }}>
        <Row justifyCenter style={{ marginBottom: 16 }}>
          <Icon icon="baby" size={40} />
        </Row>

        <Column mt="md">
          <Text text={t('recipient')} preset="regular" />
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

        <Column mt="md">
          <Row justifyBetween>
            <Text text={t('transfer_amount')} preset="regular" />
          </Row>
          <Input
            preset="amount"
            placeholder={t('amount')}
            value={inputAmount}
            runesDecimal={babylonChain.stakeCurrency.coinDecimals}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            enableMax={true}
            onMaxClick={() => {
              const amountToUse =
                parseFloat(maxAmount) <= 0 || parseFloat(maxAmount) < parseFloat(availableAmount)
                  ? availableAmount
                  : maxAmount;
              setInputAmount(amountToUse);
            }}
          />
          <Card
            style={{
              flexDirection: 'column',
              borderRadius: 8,
              padding: '8px 12px'
            }}
            gap="xs">
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 24
              }}>
              <Text text={t('available')} color="gold" />
              <Row justifyEnd itemsCenter>
                {summaryLoading ? (
                  <Text text={t('loading')} size="sm" color="gold" />
                ) : (
                  <>
                    <Text text={`${availableAmount}`} size="sm" color="gold" />
                    <Icon
                      icon="history"
                      size={14}
                      color="gold"
                      style={{ marginLeft: 4, cursor: 'pointer' }}
                      onClick={async () => {
                        setSummaryLoading(true);
                        try {
                          const summary = await wallet.getBabylonAddressSummary(babylonChainId);
                          setBabylonAddressSummary(summary);
                          simulateTransaction();
                        } catch (e) {
                          console.error('Error refreshing balance:', e);
                        } finally {
                          setSummaryLoading(false);
                        }
                      }}
                    />
                  </>
                )}
                <Text text={babylonChain.stakeCurrency.coinDenom} size="sm" color="white" />
              </Row>
            </Row>
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 20
              }}>
              <Row />
              <Text text={babylonChain.chainName} size="sm" color="textDim" />
            </Row>
          </Card>
        </Column>

        <Column mt="md">
          <Text text={t('memo')} preset="regular" />
          <Input
            placeholder={t('memo')}
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
            }}
          />
        </Column>

        <Column mt="md">
          <Row justifyBetween>
            <Text text={t('fee')} onClick={() => setFeeOptionVisible(true)} style={{ cursor: 'pointer' }} />

            <Row itemsCenter>
              {isSimulating ? (
                <Text text={t('calculating')} color="white" />
              ) : (
                <Row
                  itemsCenter
                  style={{
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                    paddingBottom: '2px'
                  }}
                  onClick={() => setFeeOptionVisible(true)}>
                  <Text
                    text={`${feeSettings.currentFeeDisplay || txFee} ${babylonChain.feeCurrencies[0].coinDenom}`}
                    color="white"
                    style={{
                      marginRight: '4px'
                    }}
                  />
                  <Icon icon="down" size={10} color="textDim" />
                </Row>
              )}
            </Row>
          </Row>
        </Column>

        {feeOptionVisible && (
          <FeeOptionsPopover
            feeOptions={feeOptions.map((option) => ({
              ...option,
              title: option.title
            }))}
            settings={feeSettings}
            onSettingsChange={handleFeeSettingsChange}
            onClose={() => {
              setFeeOptionVisible(false);
            }}
            coinDenom={babylonChain.feeCurrencies[0].coinDenom}
            feeCurrencies={babylonChain.feeCurrencies.map((fc) => fc.coinDenom)}
            txInfo={prepareTxInfo()}
          />
        )}

        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text={t('next')}
          onClick={() => {
            updateReduxState();
            navigate('BabylonTxConfirmScreen', { txInfo: prepareTxInfo() });
          }}></Button>
      </Content>
    </Layout>
  );
}
