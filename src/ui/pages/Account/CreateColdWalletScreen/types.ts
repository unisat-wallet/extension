import { AddressType } from '@unisat/wallet-types';

// Main context data interface
export interface ContextData {
  xpub: string;
  addressType: AddressType;
  version?: string;
  walletName?: string;
  hdPath?: string;
  accountCount?: number;
}

// Component props interfaces
export interface Step1Props {
  onNext: () => void;
}

export interface Step2Props {
  onNext: (data: ContextData) => void;
  onBack: () => void;
}

export interface Step3Props {
  contextData: ContextData;
  onBack: () => void;
}

export interface GeneratedAddress {
  pubkey: string;
  address: string;
  derivePath?: string;
  balance?: number;
}

export interface AddressItemProps {
  address: string;
  index: number;
  balance?: number;
  isLoadingBalance: boolean;
  getDerivePath: (index: number) => string;
  showDivider: boolean;
}
