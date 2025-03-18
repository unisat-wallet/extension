import { bbnDevnet } from '@/shared/constant/cosmosChain';

/**
 * gas fee format
 * @param fee
 * @param decimals
 * @returns formatted fee
 */
export function formatFee(fee: number, decimals = 6): string {
  const divisor = Math.pow(10, bbnDevnet.feeCurrencies[0].coinDecimals);
  return (fee / divisor).toFixed(decimals);
}
