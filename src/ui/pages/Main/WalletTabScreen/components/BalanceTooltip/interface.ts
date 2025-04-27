import { BitcoinBalanceV2 } from '@/shared/types';

export interface BalanceTooltipProps {
  /**
   * The account balance
   */
  accountBalance: BitcoinBalanceV2;

  /**
   * The unisat url
   */
  unisatUrl: string;
  /**
   * Whether to disable the utxo tools
   */
  disableUtxoTools?: boolean;
}
