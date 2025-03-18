import { DEFAULT_BBN_GAS_LIMIT } from '@/background/service/keyring/CosmosKeyring';
import { bbnDevnet } from '@/shared/constant/cosmosChain';

/**
 * calculate low, medium, high gas fee
 * @param gasPrice
 * @param gasValue
 * @param gasAdjustment
 * @returns return low, medium, high gas fee
 */
export function calculateFeeOptions(
  gasPrice: number,
  gasValue: number,
  gasAdjustment = 1.3
): { low: number; medium: number; high: number } {
  // gas fee multipliers
  const MULTIPLIERS = {
    low: 0.7,
    medium: 1.0,
    high: 1.5
  };

  const divisor = Math.pow(10, bbnDevnet.feeCurrencies[0].coinDecimals);
  const baseFee = (gasValue * parseInt(DEFAULT_BBN_GAS_LIMIT) * gasAdjustment) / divisor;

  return {
    low: baseFee * MULTIPLIERS.low * gasPrice,
    medium: baseFee * MULTIPLIERS.medium * gasPrice,
    high: baseFee * MULTIPLIERS.high * gasPrice
  };
}
