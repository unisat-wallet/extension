import * as bitcoin from 'bitcoinjs-lib';
import React, { createContext, ReactNode, useContext } from 'react';

import { AccountAsset } from '@/background/controller/wallet';
import { ContactBookItem, ContactBookStore } from '@/background/service/contactBook';
import { DisplayedKeryring, ToSignInput } from '@/background/service/keyring';
import { ConnectedSite } from '@/background/service/permission';
import { Account } from '@/background/service/preference';
import {
  BitcoinBalance,
  TxHistoryItem,
  Inscription,
  InscriptionSummary,
  AppSummary,
  UTXO,
  NetworkType,
  AddressType
} from '@/shared/types';

export interface WalletController {
  openapi?: {
    [key: string]: (...params: any) => Promise<any>;
  };

  boot(password: string): Promise<void>;
  isBooted(): Promise<boolean>;

  getApproval(): Promise<any>;
  resolveApproval(data?: any, data2?: any): Promise<void>;
  rejectApproval(data?: any, data2?: any, data3?: any): Promise<void>;

  hasVault(): Promise<boolean>;

  verifyPassword(password: string): Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;

  unlock(password: string): Promise<void>;
  isUnlocked(): Promise<boolean>;

  lockWallet(): Promise<void>;
  setPopupOpen(isOpen: boolean): void;
  isReady(): Promise<boolean>;

  getAddressBalance(address: string): Promise<BitcoinBalance>;
  getAddressCacheBalance(address: string): Promise<BitcoinBalance>;

  getAddressInscriptions(address: string): Promise<Inscription[]>;

  getAddressHistory: (address: string) => Promise<TxHistoryItem[]>;
  getAddressCacheHistory: (address: string) => Promise<TxHistoryItem[]>;

  listChainAssets: (address: string) => Promise<AccountAsset[]>;
  getTransactionHistory: (address: string) => Promise<TxHistoryItem[]>;

  getLocale(): Promise<string>;
  setLocale(locale: string): Promise<void>;

  getCurrency(): Promise<string>;
  setCurrency(currency: string): Promise<void>;

  clearKeyrings(): Promise<void>;
  getPrivateKey(password: string, account: { address: string; type: string }): Promise<string>;
  getMnemonics(password: string): Promise<{
    hdPath: string;
    mnemonic: string;
    passphrase: string;
  }>;
  importPrivateKey(data: string, alianName?: string): Promise<Account[]>;
  getPreMnemonics(): Promise<any>;
  generatePreMnemonic(): Promise<string>;
  removePreMnemonics(): void;
  createKeyringWithMnemonics(
    mnemonic: string,
    hdPath: string,
    passphrase: string
  ): Promise<{ address: string; type: string }[]>;
  removeAddress(address: string, type: string): Promise<void>;
  resetCurrentAccount(): Promise<void>;
  generateKeyringWithMnemonic(mnemonic: string): number;
  checkHasMnemonic(): boolean;
  deriveNewAccountFromMnemonic(alianName?: string): Promise<string[]>;
  getAccountsCount(): Promise<number>;
  getTypedAccounts(type: string): Promise<DisplayedKeryring[]>;
  getAllVisibleAccounts(): Promise<DisplayedKeryring[]>;
  getAllAlianName: () => (ContactBookItem | undefined)[];
  getContactsByMap: () => ContactBookStore;
  getAllVisibleAccountsArray(): Promise<Account>;
  updateAlianName: (pubkey: string, name: string) => Promise<void>;

  changeAccount(account: Account): Promise<void>;
  getCurrentAccount(): Promise<Account>;
  getAccounts(): Promise<Account[]>;
  getNewAccountAlianName: (type: string) => Promise<string>;
  getNextAccountAlianName: (type: string) => Promise<string>;

  signTransaction(psbt: bitcoin.Psbt, inputs: ToSignInput[]): Promise<bitcoin.Psbt>;

  sendBTC(data: { to: string; amount: number; utxos: UTXO[]; autoAdjust: boolean }): Promise<string>;
  sendInscription(data: { to: string; inscriptionId: string; utxos: UTXO[] }): Promise<string>;
  pushTx(rawtx: string): Promise<string>;

  getInscriptionSummary(): Promise<InscriptionSummary>;
  getAppSummary(): Promise<AppSummary>;
  getAddressUtxo(address: string): Promise<UTXO[]>;

  getAddressType(): Promise<AddressType>;
  setAddressType(type: AddressType): Promise<void>;

  getNetworkType(): Promise<NetworkType>;
  setNetworkType(type: NetworkType): Promise<void>;

  getConnectedSites(): Promise<ConnectedSite[]>;
  removeConnectedSite(origin: string): Promise<void>;
  getCurrentConnectedSite(id: string): Promise<ConnectedSite>;
}

const WalletContext = createContext<{
  wallet: WalletController;
} | null>(null);

const WalletProvider = ({ children, wallet }: { children?: ReactNode; wallet: WalletController }) => (
  <WalletContext.Provider value={{ wallet }}>{children}</WalletContext.Provider>
);

const useWallet = () => {
  const { wallet } = useContext(WalletContext) as {
    wallet: WalletController;
  };

  return wallet;
};

export { WalletProvider, useWallet };
