import { AddressType, RestoreWalletType } from '@/shared/types';

export enum TabType {
  SET_PASSWORD = 'SET_PASSWORD',
  CREATE_WORDS = 'CREATE_WORDS',
  VERIFY_WORDS = 'VERIFY_WORDS',
  IMPORT_WORDS = 'IMPORT_WORDS',
  CHOOSE_ADDRESS_TYPE = 'CHOOSE_ADDRESS_TYPE',
  CHOOSE_RESTORE_WALLET = 'CHOOSE_RESTORE_WALLET',
  KEYSTONE_WALLET = 'KEYSTONE_WALLET',
  KEYSTONE_ADDRESS_TYPE = 'KEYSTONE_ADDRESS_TYPE'
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
  step1CreateWordsCompleted: boolean;
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
  step1CreateWordsCompleted?: boolean;
  tabType?: TabType;
  restoreWalletType?: RestoreWalletType;
  isCustom?: boolean;
  customHdPath?: string;
  addressTypeIndex?: number;
  wordsType?: WordsType;
}
