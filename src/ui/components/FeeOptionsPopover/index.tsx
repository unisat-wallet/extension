import { InputNumber, Switch } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_BBN_GAS_LIMIT } from '@/background/service/keyring/CosmosKeyring';
import { bbnDevnet } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useLocationState, useWallet } from '@/ui/utils';

import { FeeOptionsBottomModal } from '../BottomModal';
import { Button } from '../Button';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { FeeOptionsPopoverProps, LocationState, MODAL_BG } from './interface';

const formatFeeDisplay = (value: string): string => {
  return parseFloat(value).toFixed(6);
};

export function FeeOptionsPopover({
  feeOptions,
  settings,
  onSettingsChange,
  onClose,
  coinDenom,
  feeCurrencies = [coinDenom],
  txInfo
}: FeeOptionsPopoverProps) {
  const [localSelectedOption, setLocalSelectedOption] = useState(settings.selectedOption);
  const [simulatedGasValue, setSimulatedGasValue] = useState<number | null>(null);
  const [gasAdjustment, setGasAdjustment] = useState<number>(settings.gasAdjustment || 1.3);
  const [gasLimit, setGasLimit] = useState<number>(settings.gasLimit || parseInt(DEFAULT_BBN_GAS_LIMIT));
  const [isAutoGasLimit, setIsAutoGasLimit] = useState<boolean>(
    settings.isAutoGasLimit !== undefined ? settings.isAutoGasLimit : true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [gasAdjustmentTimeout, setGasAdjustmentTimeout] = useState<NodeJS.Timeout | null>(null);

  const babylonConfig = useBabylonConfig();
  const wallet = useWallet();
  const { txInfo: locationTxInfo } = useLocationState<LocationState>();

  useEffect(() => {
    if (txInfo?.txFee?.amount && !settings.currentFeeDisplay) {
      onSettingsChange({
        currentFeeDisplay: txInfo.txFee.amount
      });
    }
  }, [txInfo, settings.currentFeeDisplay, onSettingsChange]);

  useEffect(() => {
    setLocalSelectedOption(settings.selectedOption);
  }, [settings.selectedOption]);

  const getValidTxInfo = useMemo(
    () => ({
      toAddress: txInfo?.toAddress || locationTxInfo?.toAddress || '',
      unitBalance: txInfo?.unitBalance || locationTxInfo?.unitBalance,
      memo: txInfo?.memo || locationTxInfo?.memo || '',
      txFee: txInfo?.txFee || locationTxInfo?.txFee
    }),
    [txInfo, locationTxInfo]
  );

  const calculateOptionFee = useCallback(
    (optionIndex: number, effectiveGasValue: number, adjustment: number) => {
      const selectedOption = feeOptions[optionIndex];
      const gasPrice = selectedOption.gasPrice;
      const fee = parseFloat(gasPrice.toString()) * effectiveGasValue * adjustment;
      const rawFormattedFee = runesUtils.toDecimalAmount(fee.toString(), bbnDevnet.feeCurrencies[0].coinDecimals);
      return formatFeeDisplay(rawFormattedFee);
    },
    [feeOptions]
  );

  const updateFeeDisplay = useCallback(
    (optionIndex: number, effectiveGasValue: number, adjustment: number) => {
      const feeValue = calculateOptionFee(optionIndex, effectiveGasValue, adjustment);
      onSettingsChange({
        currentFeeDisplay: feeValue
      });
    },
    [calculateOptionFee, onSettingsChange]
  );

  const fetchSimulatedGas = useCallback(async () => {
    if (!babylonConfig) return;
    if (!txInfo && !locationTxInfo) return;

    const { toAddress, unitBalance, memo } = getValidTxInfo;
    if (!unitBalance) return;

    setIsLoading(true);
    try {
      let targetAddress = toAddress;
      if (!targetAddress || targetAddress.trim() === '') {
        try {
          const summary = await wallet.getBabylonAddressSummary(babylonConfig.chainId, false);
          targetAddress = summary.address;
        } catch (err) {
          console.error('Error getting user address for simulation:', err);
        }
      }

      const simulatedGas = await wallet.simulateBabylonGas(babylonConfig.chainId, targetAddress, unitBalance, memo);

      if (simulatedGas) {
        const newGasLimit = Math.ceil(simulatedGas * 2);
        setSimulatedGasValue(simulatedGas);
        setGasLimit(newGasLimit);

        if (isAutoGasLimit) {
          onSettingsChange({ gasLimit: newGasLimit });
          updateFeeDisplay(localSelectedOption, newGasLimit, gasAdjustment);
        }
      }
    } catch (error) {
      console.error('Error fetching gas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    babylonConfig,
    wallet,
    txInfo,
    locationTxInfo,
    getValidTxInfo,
    isAutoGasLimit,
    onSettingsChange,
    localSelectedOption,
    gasAdjustment,
    updateFeeDisplay
  ]);

  useEffect(() => {
    if (!settings.currentFeeDisplay) {
      fetchSimulatedGas();
    }
  }, [fetchSimulatedGas, settings.currentFeeDisplay]);

  const calculatedFeeOptions = useMemo(() => {
    const effectiveGasValue = isAutoGasLimit && simulatedGasValue ? Math.ceil(simulatedGasValue * 2) : gasLimit;

    return feeOptions.map((option, index) => {
      const feeValue = calculateOptionFee(index, effectiveGasValue, gasAdjustment);

      return {
        ...option,
        adjustedGasPrice: feeValue
      };
    });
  }, [feeOptions, simulatedGasValue, gasAdjustment, isAutoGasLimit, gasLimit, calculateOptionFee]);

  const handleOptionClick = (index: number) => {
    if (isLoading) return;

    setLocalSelectedOption(index);

    const feeValue = calculatedFeeOptions[index].adjustedGasPrice;
    onSettingsChange({
      currentFeeDisplay: feeValue
    });

    if (settings.rememberChoice) {
      onSettingsChange({
        selectedOption: index
      });
    }
  };

  const handleAutoGasLimitChange = (checked: boolean) => {
    setIsAutoGasLimit(checked);
    onSettingsChange({ isAutoGasLimit: checked });

    if (checked && simulatedGasValue) {
      const newGasLimit = Math.ceil(simulatedGasValue * 2);
      onSettingsChange({ gasLimit: newGasLimit });
      updateFeeDisplay(localSelectedOption, newGasLimit, gasAdjustment);
    } else if (!checked) {
      updateFeeDisplay(localSelectedOption, gasLimit, gasAdjustment);
    }
  };

  const handleGasLimitChange = (value: number | null) => {
    if (value !== null && value > 0) {
      setGasLimit(value);
      onSettingsChange({ gasLimit: value });
      updateFeeDisplay(localSelectedOption, value, gasAdjustment);
    }
  };

  const handleGasAdjustmentChange = (value: number | null) => {
    if (value !== null && value >= 0.1 && value <= 3.0) {
      setGasAdjustment(value);
      onSettingsChange({ gasAdjustment: value });

      const effectiveGasValue = isAutoGasLimit && simulatedGasValue ? Math.ceil(simulatedGasValue * 2) : gasLimit;

      const feeValue = calculateOptionFee(localSelectedOption, effectiveGasValue, value);
      onSettingsChange({
        currentFeeDisplay: feeValue
      });

      if (gasAdjustmentTimeout) {
        clearTimeout(gasAdjustmentTimeout);
      }

      const newTimeout = setTimeout(() => {
        fetchSimulatedGas();
      }, 500);

      setGasAdjustmentTimeout(newTimeout);
    }
  };

  const handleRememberChoiceChange = (checked: boolean) => {
    onSettingsChange({ rememberChoice: checked });

    if (checked) {
      onSettingsChange({ selectedOption: localSelectedOption });
    }
  };

  const recommendedGasLimit = useMemo(
    () => (simulatedGasValue ? Math.ceil(simulatedGasValue * 2) : parseInt(DEFAULT_BBN_GAS_LIMIT)),
    [simulatedGasValue]
  );

  const renderFeeOptions = () => (
    <div
      style={{
        display: 'flex',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: MODAL_BG,
        marginBottom: 12,
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
      {calculatedFeeOptions.map((option, index) => {
        return (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: localSelectedOption === index ? colors.primary : 'transparent',
              transition: 'background-color 0.15s ease-in-out',
              opacity: isLoading ? 0.7 : 1
            }}
            onClick={() => !isLoading && handleOptionClick(index)}>
            <Text
              text={option.title}
              color="white"
              textCenter
              preset={localSelectedOption === index ? 'bold' : 'regular'}
              size="sm"
            />
            <Text
              text={isLoading ? 'Loading...' : option.adjustedGasPrice || ''}
              size="xs"
              color="white"
              textCenter
              style={{ marginTop: 6 }}
            />
          </div>
        );
      })}
    </div>
  );

  const renderGasLimitSettings = () =>
    !isAutoGasLimit && (
      <div style={{ marginBottom: 20 }}>
        <Row fullX mb="md" justifyBetween>
          <Text text="Gas Limit" color="textDim" size="sm" />
          <Row itemsCenter>
            <Text text="Auto" color="textDim" size="sm" style={{ marginRight: 8 }} />
            <Switch size="small" checked={isAutoGasLimit} onChange={handleAutoGasLimitChange} disabled={isLoading} />
          </Row>
        </Row>
        <div
          style={{
            backgroundColor: MODAL_BG,
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 8,
            opacity: isLoading ? 0.7 : 1
          }}>
          <InputNumber
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'white'
            }}
            min={1000}
            max={parseInt(DEFAULT_BBN_GAS_LIMIT)}
            step={1000}
            precision={0}
            value={gasLimit}
            onChange={handleGasLimitChange}
            placeholder={`Recommended: ${recommendedGasLimit}`}
            disabled={isLoading}
          />
        </div>
        <Row justifyBetween fullX>
          <Text text={`Recommended: ${recommendedGasLimit}`} color="textDim" size="xs" />
          <Text text="Range: 1,000 - 300,000" color="textDim" size="xs" />
        </Row>
        <Column mt="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: 8 }}>
          <Text text="Gas Limit Explanation:" color="textDim" size="xs" style={{ marginBottom: 4 }} />
          <Text text="• Controls maximum computational resources for transaction" color="textDim" size="xs" />
          <Text text="• Higher limit = higher potential fees but ensures completion" color="textDim" size="xs" />
          <Text text="• Too low may cause transaction failure" color="textDim" size="xs" />
          <Text text="• Recommended value is usually sufficient" color="textDim" size="xs" />
        </Column>
      </div>
    );

  const renderGasAdjustmentSettings = () =>
    isAutoGasLimit && (
      <div style={{ marginBottom: 20 }}>
        <Row fullX mb="md" justifyBetween>
          <Text text="Gas Adjustment" color="textDim" size="sm" />
          <Row itemsCenter>
            <Text text="Auto" color="textDim" size="sm" style={{ marginRight: 8 }} />
            <Switch size="small" checked={isAutoGasLimit} onChange={handleAutoGasLimitChange} disabled={isLoading} />
          </Row>
        </Row>
        <div
          style={{
            backgroundColor: MODAL_BG,
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 8,
            opacity: isLoading ? 0.7 : 1
          }}>
          <InputNumber
            style={{ width: '100%', backgroundColor: 'transparent', color: 'white' }}
            min={0.1}
            max={3.0}
            step={0.1}
            precision={1}
            value={gasAdjustment}
            onChange={handleGasAdjustmentChange}
            disabled={isLoading}
          />
        </div>
        <Row justifyBetween fullX>
          <Text text="Default: 1.3" color="textDim" size="xs" />
          <Text text="Range: 0.1 - 3.0" color="textDim" size="xs" />
        </Row>
        <Column mt="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: 8 }}>
          <Text text="Gas Adjustment Explanation:" color="textDim" size="xs" style={{ marginBottom: 4 }} />
          <Text text="• Multiplier applied to estimated gas (1.0 = 100%)" color="textDim" size="xs" />
          <Text text="• Default 1.3 (130%) provides safety margin" color="textDim" size="xs" />
          <Text text="• Higher values increase transaction success chance" color="textDim" size="xs" />
        </Column>
      </div>
    );

  useEffect(() => {
    return () => {
      if (gasAdjustmentTimeout) {
        clearTimeout(gasAdjustmentTimeout);
      }
    };
  }, [gasAdjustmentTimeout]);

  return (
    <FeeOptionsBottomModal onClose={onClose}>
      <Column style={{ padding: '0 4px' }}>
        <div className="fees-section" style={{ marginBottom: 20 }}>
          <Row justifyBetween fullX mb="md">
            <Text text="Fee" color="textDim" size="sm" />
            <Row itemsCenter>
              <Text text="Remember my choice" color="textDim" size="sm" style={{ marginRight: 8 }} />
              <Switch
                size="small"
                checked={settings.rememberChoice}
                onChange={handleRememberChoiceChange}
                disabled={isLoading}
              />
            </Row>
          </Row>

          {renderFeeOptions()}
        </div>

        {renderGasLimitSettings()}
        {renderGasAdjustmentSettings()}

        <Button
          preset="primary"
          text={isLoading ? 'Loading...' : 'Close'}
          onClick={isLoading ? undefined : onClose}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            fontWeight: 'bold',
            marginBottom: 8,
            opacity: isLoading ? 0.7 : 1
          }}
        />
      </Column>
    </FeeOptionsBottomModal>
  );
}
