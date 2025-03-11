import { InputNumber, Switch } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_BBN_GAS_LIMIT } from '@/background/service/keyring/CosmosKeyring';
import { bbnDevnet } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

import { BottomModal } from '../BottomModal';
import { Button } from '../Button';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { FeeOptionsPopoverProps, MODAL_BG } from './interface';

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
  const { t } = useI18n();
  const wallet = useWallet();

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
      toAddress: txInfo?.toAddress || '',
      unitBalance: txInfo?.unitBalance,
      memo: txInfo?.memo || '',
      txFee: txInfo?.txFee
    }),
    [txInfo]
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
    if (!txInfo) return;

    const { toAddress, unitBalance, memo } = getValidTxInfo;
    if (!unitBalance) return;

    setIsLoading(true);
    try {
      let targetAddress = toAddress;
      if (!targetAddress || targetAddress.trim() === '') {
        try {
          const address = await wallet.getBabylonAddress(babylonConfig.chainId);
          targetAddress = address;
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
          const newFeeValue = calculateOptionFee(localSelectedOption, newGasLimit, gasAdjustment);
          onSettingsChange({
            gasLimit: newGasLimit,
            currentFeeDisplay: newFeeValue
          });
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
    getValidTxInfo,
    isAutoGasLimit,
    onSettingsChange,
    localSelectedOption,
    gasAdjustment,
    calculateOptionFee
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
      currentFeeDisplay: feeValue,
      selectedOption: index
    });
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

      const effectiveGasValue = isAutoGasLimit && simulatedGasValue ? Math.ceil(simulatedGasValue * 2) : gasLimit;
      const feeValue = calculateOptionFee(localSelectedOption, effectiveGasValue, value);

      onSettingsChange({
        gasAdjustment: value,
        currentFeeDisplay: feeValue
      });

      if (gasAdjustmentTimeout) {
        clearTimeout(gasAdjustmentTimeout);
      }
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
              text={isLoading ? t('loading') : option.adjustedGasPrice || ''}
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
          <Text text={t('gas_limit')} color="textDim" size="sm" />
          <Row itemsCenter>
            <Text text={t('auto')} color="textDim" size="sm" style={{ marginRight: 8 }} />
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
            placeholder={`${t('recommended')}: ${recommendedGasLimit}`}
            disabled={isLoading}
          />
        </div>
        <Row justifyBetween fullX>
          <Text text={`${t('recommended')}: ${recommendedGasLimit}`} color="textDim" size="xs" />
          <Text text={`${t('range')}: 1,000 - 300,000`} color="textDim" size="xs" />
        </Row>
        <Column mt="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: 8 }}>
          <Text text={t('gas_limit_explanation')} color="textDim" size="xs" style={{ marginBottom: 4 }} />
          <Text text={t('gas_limit_explanation_1')} color="textDim" size="xs" />
          <Text text={t('gas_limit_explanation_2')} color="textDim" size="xs" />
          <Text text={t('gas_limit_explanation_3')} color="textDim" size="xs" />
          <Text text={t('gas_limit_explanation_4')} color="textDim" size="xs" />
        </Column>
      </div>
    );

  const renderGasAdjustmentSettings = () =>
    isAutoGasLimit && (
      <div style={{ marginBottom: 20 }}>
        <Row fullX mb="md" justifyBetween>
          <Text text={t('gas_adjustment')} color="textDim" size="sm" />
          <Row itemsCenter>
            <Text text={t('auto')} color="textDim" size="sm" style={{ marginRight: 8 }} />
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
          <Text text={`${t('default')}: 1.3`} color="textDim" size="xs" />
          <Text text={`${t('range')}: 0.1 - 3.0`} color="textDim" size="xs" />
        </Row>
        <Column mt="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: 8 }}>
          <Text text={t('gas_adjustment_explanation')} color="textDim" size="xs" style={{ marginBottom: 4 }} />
          <Text text={t('gas_adjustment_explanation_1')} color="textDim" size="xs" />
          <Text text={t('gas_adjustment_explanation_2')} color="textDim" size="xs" />
          <Text text={t('gas_adjustment_explanation_3')} color="textDim" size="xs" />
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

  const handleClose = () => {
    if (calculatedFeeOptions && calculatedFeeOptions.length > 0) {
      const currentFee = calculatedFeeOptions[localSelectedOption].adjustedGasPrice;
      onSettingsChange({ currentFeeDisplay: currentFee });
    }
    onClose();
  };

  return (
    <BottomModal onClose={handleClose}>
      <Column style={{ padding: '0 4px' }}>
        <div className="fees-section" style={{ marginBottom: 20 }}>
          <Row justifyBetween fullX mb="md">
            <Text text={t('fee')} color="textDim" size="sm" />
            <Row itemsCenter>
              <Text text={t('remember_my_choice')} color="textDim" size="sm" style={{ marginRight: 8 }} />
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
          text={isLoading ? t('loading') : t('close')}
          onClick={isLoading ? undefined : handleClose}
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
    </BottomModal>
  );
}
