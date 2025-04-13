import { BabylonTxInfo } from '@/shared/types';

/**
 * Fee option interface
 */
export interface FeeOption {
  /**
   * Title
   */
  title: string;
  /**
   * Gas price
   */
  gasPrice: number;
}

/**
 * Fee settings interface
 */
export interface FeeSettings {
  /**
   * Selected option index
   */
  selectedOption: number;
  /**
   * Remember choice
   */
  rememberChoice: boolean;
  /**
   * Selected currency
   */
  selectedCurrency: string;
  /**
   * Gas adjustment factor
   */
  gasAdjustment?: number;
  /**
   * Gas limit
   */
  gasLimit?: number;
  /**
   * Whether to use automatic gas limit
   */
  isAutoGasLimit?: boolean;
  /**
   * Current fee display
   */
  currentFeeDisplay?: string;
}

/**
 * Props for the FeeOptionsPopover component
 */
export interface FeeOptionsPopoverProps {
  /**
   * Available fee options
   */
  feeOptions: FeeOption[];
  /**
   * Current fee settings
   */
  settings: FeeSettings;
  /**
   * Callback when settings are changed
   */
  onSettingsChange: (settings: Partial<FeeSettings>) => void;
  /**
   * Callback when the popover is closed
   */
  onClose: () => void;
  /**
   * Coin denomination to display
   */
  coinDenom: string;
  /**
   * Available fee currencies
   */
  feeCurrencies?: string[];
  /**
   * Transaction information
   */
  txInfo?: BabylonTxInfo;
}

// Main color
export const MODAL_BG = '#252525';

export interface LocationState {
  /**
   * Transaction information
   */
  txInfo: BabylonTxInfo;
}
