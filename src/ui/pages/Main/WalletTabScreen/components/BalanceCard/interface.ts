import { BitcoinBalanceV2 } from '@/shared/types';

export interface BalanceCardProps {
  /**
   * The account balance
   */
  accountBalance: BitcoinBalanceV2;
  /**
   * Whether to disable the utxo tools
   */
  disableUtxoTools?: boolean;
  /**
   * Whether to enable the refresh button and automatic refresh function
   */
  enableRefresh?: boolean;
}
