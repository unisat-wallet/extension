/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import Mnemonic from 'bitcore-mnemonic';
import ECPairFactory from 'ecpair';
import { cloneDeep, groupBy } from 'lodash';
import * as ecc from 'tiny-secp256k1';

import { contactBookService, keyringService, openapiService, preferenceService } from '@/background/service';
import i18n from '@/background/service/i18n';
import { DisplayedKeryring, Keyring, KEYRING_CLASS, ToSignInput } from '@/background/service/keyring';
import {
  BRAND_ALIAN_TYPE_TEXT,
  COIN_NAME,
  COIN_SYMBOL,
  KEYRING_TYPE,
  OPENAPI_URL_MAINNET,
  OPENAPI_URL_TESTNET
} from '@/shared/constant';
import { AddressType, BitcoinBalance, NetworkType, UTXO } from '@/shared/types';
import { Wallet } from '@unisat/bitcoinjs-wallet';

import { ContactBookItem } from '../service/contactBook';
import { OpenApiService } from '../service/openapi';
import { Account } from '../service/preference';
import { SingleAccountTransaction, toPsbtNetwork } from '../utils/tx-utils';
import BaseController from './base';

const stashKeyrings: Record<string, Keyring> = {};

const ECPair = ECPairFactory(ecc);

export const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

export type AccountAsset = {
  name: string;
  symbol: string;
  amount: string;
  value: string;
};

export class WalletController extends BaseController {
  openapi: OpenApiService = openapiService;

  /* wallet */
  boot = (password: string) => keyringService.boot(password);
  isBooted = () => keyringService.isBooted();

  hasVault = () => keyringService.hasVault();
  verifyPassword = (password: string) => keyringService.verifyPassword(password);
  changePassword = (password: string, newPassword: string) => keyringService.changePassword(password, newPassword);

  initAlianNames = async () => {
    await preferenceService.changeInitAlianNameStatus();
    const contacts = await this.listContact();
    const keyrings = await keyringService.getAllTypedAccounts();
    const catergoryGroupAccount = keyrings.map((item) => ({
      type: item.type,
      accounts: item.accounts
    }));
    if (keyrings.length > 0) {
      const catergories = groupBy(
        catergoryGroupAccount.filter((group) => group.type !== 'WalletConnect'),
        'type'
      );
      const result = Object.keys(catergories)
        .map((key) =>
          catergories[key].map((item) =>
            item.accounts.map((acc) => ({
              address: acc.address,
              type: key
            }))
          )
        )
        .map((item) => item.flat(1));
      result.forEach((group) =>
        group.forEach((acc, index) => {
          this.updateAlianName(acc?.address, `${BRAND_ALIAN_TYPE_TEXT[acc?.type]} ${index + 1}`);
        })
      );
    }
    if (contacts.length !== 0 && keyrings.length !== 0) {
      const allAccounts = keyrings.map((item) => item.accounts).flat();
      const sameAddressList = contacts.filter((item) => allAccounts.find((contact) => contact.address == item.address));
      if (sameAddressList.length > 0) {
        sameAddressList.forEach((item) => this.updateAlianName(item.address, item.name));
      }
    }
  };

  isReady = () => {
    if (contactBookService.store) {
      return true;
    } else {
      return false;
    }
  };

  unlock = async (password: string) => {
    const alianNameInited = preferenceService.getInitAlianNameStatus();
    const alianNames = contactBookService.listAlias();
    await keyringService.submitPassword(password);
    if (!alianNameInited && alianNames.length === 0) {
      this.initAlianNames();
    }
  };
  isUnlocked = () => {
    return keyringService.memStore.getState().isUnlocked;
  };

  lockWallet = async () => {
    await keyringService.setLocked();
  };
  setPopupOpen = (isOpen: boolean) => {
    preferenceService.setPopupOpen(isOpen);
  };

  getAddressBalance = async (address: string) => {
    const data = await openapiService.getAddressBalance(address);
    preferenceService.updateAddressBalance(address, data);
    return data;
  };
  getAddressCacheBalance = (address: string | undefined): BitcoinBalance => {
    const defaultBalance: BitcoinBalance = {
      confirm_amount: '0',
      pending_amount: '0',
      amount: '0',
      usd_value: '0'
    };
    if (!address) return defaultBalance;
    return preferenceService.getAddressBalance(address) || defaultBalance;
  };

  getAddressHistory = async (address: string) => {
    const data = await openapiService.getAddressRecentHistory(address);
    preferenceService.updateAddressHistory(address, data);
    return data;
  };

  getAddressInscriptions = async (address: string) => {
    const data = await openapiService.getAddressInscriptions(address);
    return data;
  };

  getAddressCacheHistory = (address: string | undefined) => {
    if (!address) return [];
    return preferenceService.getAddressHistory(address);
  };

  getExternalLinkAck = () => {
    preferenceService.getExternalLinkAck();
  };

  setExternalLinkAck = (ack) => {
    preferenceService.setExternalLinkAck(ack);
  };

  getLocale = () => {
    return preferenceService.getLocale();
  };

  setLocale = (locale: string) => {
    preferenceService.setLocale(locale);
  };

  getCurrency = () => {
    return preferenceService.getCurrency();
  };

  setCurrency = (currency: string) => {
    preferenceService.setCurrency(currency);
  };

  /* keyrings */

  clearKeyrings = () => keyringService.clearKeyrings();

  getPrivateKey = async (password: string, { address, type }: { address: string; type: string }) => {
    await this.verifyPassword(password);
    const keyring = await keyringService.getKeyringForAccount(address, type);
    if (!keyring) return null;
    const privateKey = await keyring.exportAccount(address);
    const network = await this.getNetwork();
    return ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network }).toWIF();
  };

  getMnemonics = async (password: string) => {
    await this.verifyPassword(password);
    const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);
    const serialized = await keyring.serialize();
    const seedWords = serialized.mnemonic;

    return seedWords;
  };

  importPrivateKey = async (data: string, alianName?: string) => {
    const error = new Error(i18n.t('The private key is invalid'));

    let keyring: Keyring;
    try {
      keyring = await keyringService.importPrivateKey(data);
    } catch (e) {
      console.log(e);
      throw error;
    }
    const accounts = await keyring.getAccounts();
    if (alianName) this.updateAlianName(accounts[0], alianName);
    return this._setCurrentAccountFromKeyring(keyring, 0, alianName);
  };

  // json format is from "https://github.com/SilentCicero/ethereumjs-accounts"
  // or "https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition"
  // for example: https://www.myetherwallet.com/create-wallet
  importJson = async (content: string, password: string) => {
    try {
      JSON.parse(content);
    } catch {
      throw new Error(i18n.t('the input file is invalid'));
    }

    const wallet = await Wallet.fromV3(content, password);

    const privateKey = wallet.getPrivateKeyString();
    const keyring = await keyringService.importPrivateKey(privateKey);
    return this._setCurrentAccountFromKeyring(keyring);
  };

  getPreMnemonics = () => keyringService.getPreMnemonics();
  generatePreMnemonic = () => keyringService.generatePreMnemonic();
  removePreMnemonics = () => keyringService.removePreMnemonics();
  createKeyringWithMnemonics = async (mnemonic: string) => {
    const keyring = await keyringService.createKeyringWithMnemonics(mnemonic);
    keyringService.removePreMnemonics();
    return this._setCurrentAccountFromKeyring(keyring, 0);
  };

  removeAddress = async (address: string, type: string, brand?: string) => {
    await keyringService.removeAccount(address, type, brand);
    if (!(await keyringService.hasAddress(address))) {
      contactBookService.removeAlias(address);
    }
    preferenceService.removeAddressBalance(address);
    const current = preferenceService.getCurrentAccount();
    if (current?.address === address && current.type === type && current.brandName === brand) {
      this.resetCurrentAccount();
    }
  };

  resetCurrentAccount = async () => {
    const [account] = await this.getAccounts();
    if (account) {
      preferenceService.setCurrentAccount(account);
    } else {
      preferenceService.setCurrentAccount(null);
    }
  };

  generateKeyringWithMnemonic = (mnemonic: string) => {
    if (!Mnemonic.isValid(mnemonic)) {
      throw new Error(i18n.t('The mnemonic phrase is invalid'));
    }

    const Keyring = keyringService.getKeyringClassForType(KEYRING_CLASS.MNEMONIC);

    const keyring = new Keyring({ mnemonic });

    const stashId = Object.values(stashKeyrings).length;
    stashKeyrings[stashId] = keyring;

    return stashId;
  };

  addKyeringToStash = (keyring: Keyring) => {
    const stashId = Object.values(stashKeyrings).length;
    stashKeyrings[stashId] = keyring;

    return stashId;
  };

  addKeyring = async (keyringId: string) => {
    const keyring = stashKeyrings[keyringId];
    if (keyring) {
      await keyringService.addKeyring(keyring);
      this._setCurrentAccountFromKeyring(keyring);
    } else {
      throw new Error('failed to addKeyring, keyring is undefined');
    }
  };

  getKeyringByType = (type: string) => {
    return keyringService.getKeyringByType(type);
  };

  checkHasMnemonic = () => {
    try {
      const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC) as any;
      return !!keyring.mnemonic;
    } catch (e) {
      return false;
    }
  };

  deriveNewAccountFromMnemonic = async (alianName?: string) => {
    const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);

    const result = await keyringService.addNewAccount(keyring);
    if (alianName) this.updateAlianName(result[0], alianName);
    this._setCurrentAccountFromKeyring(keyring, -1, alianName);
    return result;
  };

  getAccountsCount = async () => {
    const accounts = await keyringService.getAccounts();
    return accounts.filter((x) => x).length;
  };

  getTypedAccounts = async (type: string) => {
    return Promise.all(
      keyringService.keyrings
        .filter((keyring) => !type || keyring.type === type)
        .map((keyring) => keyringService.displayForKeyring(keyring))
    );
  };

  getAllVisibleAccounts = async (): Promise<DisplayedKeryring[]> => {
    const typedAccounts = await keyringService.getAllTypedVisibleAccounts();

    return typedAccounts.map((account) => ({
      ...account,
      keyring: account.keyring
    }));
  };

  getAllVisibleAccountsArray = async (): Promise<Account[]> => {
    const _accounts = await keyringService.getAllVisibleAccountsArray();
    const accounts: Account[] = [];
    _accounts.forEach((v) => {
      accounts.push({
        type: v.type,
        address: v.address,
        brandName: v.brandName,
        alianName: this.getAlianName(v.address)
      });
    });
    return accounts;
  };

  getAllClassAccounts = async () => {
    const typedAccounts = await keyringService.getAllTypedAccounts();

    return typedAccounts.map((account) => ({
      ...account,
      keyring: account.keyring
    }));
  };

  changeAccount = (account: Account) => {
    preferenceService.setCurrentAccount(account);
  };

  signTransaction = async (type: string, from: string, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
    const keyring = await keyringService.getKeyringForAccount(from, type);
    return keyringService.signTransaction(keyring, psbt, inputs);
  };

  requestKeyring = (type: string, methodName: string, keyringId: number | null, ...params) => {
    let keyring;
    if (keyringId !== null && keyringId !== undefined) {
      keyring = stashKeyrings[keyringId];
    } else {
      try {
        keyring = this._getKeyringByType(type);
      } catch {
        const Keyring = keyringService.getKeyringClassForType(type);
        keyring = new Keyring();
      }
    }
    if (keyring[methodName]) {
      return keyring[methodName].call(keyring, ...params);
    }
  };

  getTransactionHistory = async (address: string) => {
    const result = await openapiService.getAddressRecentHistory(address);
    return result;
  };

  private _getKeyringByType = (type: string): Keyring => {
    const keyring = keyringService.getKeyringsByType(type)[0];

    if (keyring) {
      return keyring;
    }

    throw new Error(`No ${type} keyring found`);
  };

  addContact = (data: ContactBookItem) => {
    contactBookService.addContact(data);
  };

  updateContact = (data: ContactBookItem) => {
    contactBookService.updateContact(data);
  };

  removeContact = (address: string) => {
    contactBookService.removeContact(address);
  };

  listContact = (includeAlias = true) => {
    const list = contactBookService.listContacts();
    if (includeAlias) {
      return list;
    } else {
      return list.filter((item) => !item.isAlias);
    }
  };

  getContactsByMap = () => {
    return contactBookService.getContactsByMap();
  };

  getContactByAddress = (address: string) => {
    return contactBookService.getContactByAddress(address);
  };

  getNewAccountAlianName = async (type: string, index = 0) => {
    const sameTypeAccounts = await this.getTypedAccounts(type);
    let accountLength = 0;
    if (type == KEYRING_TYPE.HdKeyring) {
      if (sameTypeAccounts.length > 0) {
        accountLength = sameTypeAccounts[0]?.accounts?.length;
      }
    } else if (type == KEYRING_TYPE.SimpleKeyring) {
      accountLength = sameTypeAccounts.length;
    }
    if (index == 0) {
      index = accountLength;
    }
    const alianName = `${BRAND_ALIAN_TYPE_TEXT[type]} ${index}`;
    return alianName;
  };

  getNextAccountAlianName = async (type: string) => {
    const sameTypeAccounts = await this.getTypedAccounts(type);
    let accountLength = 0;
    if (type == KEYRING_TYPE.HdKeyring) {
      if (sameTypeAccounts.length > 0) {
        accountLength = sameTypeAccounts[0]?.accounts?.length;
      }
    } else if (type == KEYRING_TYPE.SimpleKeyring) {
      accountLength = sameTypeAccounts.length;
    }

    const alianName = `${BRAND_ALIAN_TYPE_TEXT[type]} ${accountLength + 1}`;
    return alianName;
  };

  private _setCurrentAccountFromKeyring = async (keyring: Keyring, index = 0, alianName?: string) => {
    const accounts = await keyring.getAccounts();
    const account = accounts[index < 0 ? index + accounts.length : index];

    if (!account) {
      throw new Error('the current account is empty');
    }

    alianName = alianName || this.getAlianName(account) || (await this.getNewAccountAlianName(keyring.type));

    const _account: Account = {
      address: account,
      type: keyring.type,
      brandName: keyring.type,
      alianName,
      index
    };
    preferenceService.setCurrentAccount(_account);

    return [_account];
  };

  getHighlightWalletList = () => {
    return preferenceService.getWalletSavedList();
  };

  updateHighlightWalletList = (list) => {
    return preferenceService.updateWalletSavedList(list);
  };

  getAlianName = (address: string) => {
    const contactName = contactBookService.getContactByAddress(address)?.name;
    return contactName;
  };

  updateAlianName = (address: string, name: string) => {
    contactBookService.updateAlias({
      name,
      address
    });
  };

  getAllAlianName = () => {
    return contactBookService.listAlias();
  };

  getInitAlianNameStatus = () => {
    return preferenceService.getInitAlianNameStatus();
  };

  updateInitAlianNameStatus = () => {
    preferenceService.changeInitAlianNameStatus();
  };

  getIsFirstOpen = () => {
    return preferenceService.getIsFirstOpen();
  };

  updateIsFirstOpen = () => {
    return preferenceService.updateIsFirstOpen();
  };

  listChainAssets = async (pubkeyAddress: string) => {
    const balance = await openapiService.getAddressBalance(pubkeyAddress);
    const assets: AccountAsset[] = [
      { name: COIN_NAME, symbol: COIN_SYMBOL, amount: balance.amount, value: balance.usd_value }
    ];
    return assets;
  };

  reportErrors = (error: string) => {
    console.error('report not implemented');
  };

  getAddressType = () => {
    return preferenceService.getAddressType();
  };

  setAddressType = (addressType: AddressType) => {
    preferenceService.setAddressType(addressType);
  };

  getNetworkType = async () => {
    const networkType = preferenceService.getNetworkType();
    return networkType;
  };

  setNetworkType = async (networkType: NetworkType) => {
    preferenceService.setNetworkType(networkType);
    if (networkType === NetworkType.MAINNET) {
      this.openapi.setHost(OPENAPI_URL_MAINNET);
    } else {
      this.openapi.setHost(OPENAPI_URL_TESTNET);
    }
  };

  getNetwork = async () => {
    const networkType = await this.getNetworkType();
    return toPsbtNetwork(networkType);
  };

  sendBTC = async ({
    to,
    amount,
    utxos,
    autoAdjust
  }: {
    to: string;
    amount: number;
    utxos: UTXO[];
    autoAdjust: boolean;
  }) => {
    const account = preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const addressType = preferenceService.getAddressType();
    const networkType = preferenceService.getNetworkType();
    const tx = new SingleAccountTransaction(account, this, addressType, networkType);

    const safeUTXOs: UTXO[] = [];
    utxos.forEach((utxo) => {
      const nftCount = utxo.inscriptions.length;
      if (nftCount > 0) {
        // todo
      } else {
        safeUTXOs.push(utxo);
      }
    });

    safeUTXOs.forEach((utxo) => {
      tx.addInput(utxo);
    });

    tx.addOutput(to, amount);

    const data = await tx.generate(autoAdjust);
    return data;
  };

  sendInscription = async ({ to, inscriptionId, utxos }: { to: string; inscriptionId: string; utxos: UTXO[] }) => {
    const account = await preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const addressType = preferenceService.getAddressType();
    const networkType = preferenceService.getNetworkType();

    const tx = new SingleAccountTransaction(account, this, addressType, networkType);

    const NFT_DUST = 546;
    const toAddress = to;
    const safeUTXOs: UTXO[] = [];

    let leftAmount = 0;
    utxos.forEach((utxo) => {
      const nftCount = utxo.inscriptions.length;
      if (nftCount > 0) {
        const nft = utxo.inscriptions.find((v) => v.id === inscriptionId);
        if (!nft) {
          // not found
          return;
        }

        if (nftCount > 1) {
          // not supoort
          // console.log("found but not support");
          throw new Error('found but not support');
          // return;
        }

        leftAmount = utxo.satoshis;
        if (nft.offset > NFT_DUST) {
          tx.addChangeOutput(nft.offset);
          leftAmount -= nft.offset;
        }

        tx.addOutput(toAddress, NFT_DUST);
        leftAmount -= NFT_DUST;

        tx.addInput(utxo);
      } else {
        safeUTXOs.push(utxo);
      }
    });

    safeUTXOs.forEach((utxo) => {
      leftAmount += utxo.satoshis;
      tx.addInput(utxo);
    });

    if (leftAmount <= 0) {
      throw new Error('not enough balance');
    }

    tx.addChangeOutput(leftAmount);

    const data = await tx.generateForInscriptionTx();
    return data;
  };

  pushTx = async (rawtx: string) => {
    const txid = await this.openapi.pushTx(rawtx);
    return txid;
  };

  getAccounts = async () => {
    const accounts: Account[] = await keyringService.getAllVisibleAccountsArray();
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      account.alianName =
        this.getAlianName(account.address) || (await this.getNewAccountAlianName(account.type, i + 1));
    }

    return accounts;
  };

  getCurrentAccount = async () => {
    let account = preferenceService.getCurrentAccount();
    if (account) {
      const accounts = await this.getAccounts();
      const matchAcct = accounts.find((acct) => account!.address === acct.address);
      if (!matchAcct) account = undefined;
    }

    if (!account) {
      [account] = await this.getAccounts();
      if (!account) return null;
      preferenceService.setCurrentAccount(account);
    }

    return cloneDeep(account) as Account;
  };

  getInscriptionSummary = async () => {
    const data = await openapiService.getInscriptionSummary();
    return data;
  };

  getAppSummary = async () => {
    const data = await openapiService.getAppSummary();
    return data;
  };

  getAddressUtxo = async (address: string) => {
    const data = await openapiService.getAddressUtxo(address);
    return data;
  };
}

export default new WalletController();
