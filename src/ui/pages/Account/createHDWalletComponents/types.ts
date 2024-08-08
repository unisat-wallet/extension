import { AddressType, RestoreWalletType } from '@/shared/types';


export enum TabType {
  STEP1 = 'STEP1',
  STEP2 = 'STEP2',
  STEP3 = 'STEP3'
}

export enum WordsType {
  WORDS_12,
  WORDS_24
}

export interface ContextData {
  mnemonics: string;
  hdPath: string;
  passphrase: string;
  addressType: AddressType;
  step1Completed: boolean;
  tabType: TabType;
  restoreWalletType: RestoreWalletType;
  isRestore: boolean;
  isCustom: boolean;
  customHdPath: string;
  addressTypeIndex: number;
  wordsType: WordsType;
}

export interface UpdateContextDataParams {
  mnemonics?: string;
  hdPath?: string;
  passphrase?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  tabType?: TabType;
  restoreWalletType?: RestoreWalletType;
  isCustom?: boolean;
  customHdPath?: string;
  addressTypeIndex?: number;
  wordsType?: WordsType;
}
