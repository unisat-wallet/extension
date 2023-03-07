/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import { address as PsbtAddress } from 'bitcoinjs-lib';
import Mnemonic from 'bitcore-mnemonic';
import ECPairFactory from 'ecpair';
import { cloneDeep, groupBy } from 'lodash';
import * as ecc from 'tiny-secp256k1';

import {
  contactBookService,
  keyringService,
  notificationService,
  openapiService,
  permissionService,
  preferenceService,
  sessionService
} from '@/background/service';
import i18n from '@/background/service/i18n';
import { DisplayedKeryring, Keyring, KEYRING_CLASS, ToSignInput } from '@/background/service/keyring';
import {
  BRAND_ALIAN_TYPE_TEXT,
  CHAINS_ENUM,
  COIN_NAME,
  COIN_SYMBOL,
  KEYRING_TYPE,
  NETWORK_TYPES,
  OPENAPI_URL_MAINNET,
  OPENAPI_URL_TESTNET
} from '@/shared/constant';
import { AddressType, BitcoinBalance, NetworkType, UTXO } from '@/shared/types';
import { Wallet } from '@unisat/bitcoinjs-wallet';
import { createSendBTC, createSendOrd } from '@unisat/ord-utils';

import { ContactBookItem } from '../service/contactBook';
import { OpenApiService } from '../service/openapi';
import { ConnectedSite } from '../service/permission';
import { Account } from '../service/preference';
import { publicKeyToAddress, toPsbtNetwork } from '../utils/tx-utils';
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

  getApproval = notificationService.getApproval;
  resolveApproval = notificationService.resolveApproval;
  rejectApproval = notificationService.rejectApproval;

  hasVault = () => keyringService.hasVault();
  verifyPassword = (password: string) => keyringService.verifyPassword(password);
  changePassword = (password: string, newPassword: string) => keyringService.changePassword(password, newPassword);

  initAlianNames = async () => {
    preferenceService.changeInitAlianNameStatus();
    const contacts = this.listContact();
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
    sessionService.broadcastEvent('unlock');
    if (!alianNameInited && alianNames.length === 0) {
      this.initAlianNames();
    }
  };
  isUnlocked = () => {
    return keyringService.memStore.getState().isUnlocked;
  };

  lockWallet = async () => {
    await keyringService.setLocked();
    sessionService.broadcastEvent('accountsChanged', []);
    sessionService.broadcastEvent('lock');
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

  getPrivateKey = async (password: string, { pubkey, type }: { pubkey: string; type: string }) => {
    await this.verifyPassword(password);
    const keyring = await keyringService.getKeyringForAccount(pubkey, type);
    if (!keyring) return null;
    const privateKey = await keyring.exportAccount(pubkey);
    const networkType = this.getNetworkType();
    const network = toPsbtNetwork(networkType);
    return ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network }).toWIF();
  };

  getMnemonics = async (password: string) => {
    await this.verifyPassword(password);
    const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);
    const serialized = await keyring.serialize();
    return {
      mnemonic: serialized.mnemonic,
      hdPath: serialized.hdPath,
      passphrase: serialized.passphrase
    };
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
    const pubkeys = await keyring.getAccounts();
    if (alianName) this.updateAlianName(pubkeys[0], alianName);
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
  createKeyringWithMnemonics = async (mnemonic: string, hdPath: string, passphrase: string) => {
    const keyring = await keyringService.createKeyringWithMnemonics(mnemonic, hdPath, passphrase);
    keyringService.removePreMnemonics();
    return this._setCurrentAccountFromKeyring(keyring, 0);
  };

  removeAddress = async (pubkey: string, type: string, brand?: string) => {
    await keyringService.removeAccount(pubkey, type, brand);
    if (!(await keyringService.hasAddress(pubkey))) {
      contactBookService.removeAlias(pubkey);
    }

    const current = preferenceService.getCurrentAccount();
    preferenceService.removeAddressBalance(current?.address || '');

    if (current?.pubkey === pubkey && current.type === type && current.brandName === brand) {
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
    const keyringAccounts = await keyringService.getAllVisibleAccountsArray();
    const accounts: Account[] = [];
    const networkType = preferenceService.getNetworkType();
    const addressType = preferenceService.getAddressType();
    keyringAccounts.forEach((v) => {
      const pubkey = v.address;
      const address = publicKeyToAddress(pubkey, addressType, networkType);
      accounts.push({
        type: v.type,
        pubkey,
        address,
        brandName: v.brandName,
        alianName: this.getAlianName(pubkey)
      });
    });
    return accounts;
  };

  changeAccount = (account: Account) => {
    preferenceService.setCurrentAccount(account);
  };

  signTransaction = async (type: string, from: string, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
    const keyring = await keyringService.getKeyringForAccount(from, type);
    return keyringService.signTransaction(keyring, psbt, inputs);
  };

  signPsbt = async (psbt: bitcoin.Psbt, inputs?: ToSignInput[]) => {
    const account = preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const networkType = this.getNetworkType();
    const psbtNetwork = toPsbtNetwork(networkType);
    const keyring = await keyringService.getKeyringForAccount(account.pubkey, account.type);
    if (!inputs) {
      const toSignInputs: ToSignInput[] = [];
      psbt.data.inputs.forEach((v, index) => {
        const script = v.witnessUtxo?.script || v.nonWitnessUtxo;
        if (script) {
          const address = PsbtAddress.fromOutputScript(script, psbtNetwork);
          if (account.address === address) {
            toSignInputs.push({
              index,
              publicKey: account.pubkey
            });
          }
        }
      });
      inputs = toSignInputs;
    }
    return keyringService.signTransaction(keyring, psbt, inputs);
  };

  signMessage = async (text: string) => {
    const account = preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');
    return keyringService.signMessage(account.pubkey, text);
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
    const pubkeys = await keyring.getAccounts();
    const pubkey = pubkeys[index < 0 ? index + pubkeys.length : index];

    if (!pubkey) {
      throw new Error('the current account is empty');
    }

    alianName = alianName || this.getAlianName(pubkey) || (await this.getNewAccountAlianName(keyring.type));

    const addressType = preferenceService.getAddressType();
    const networkType = preferenceService.getNetworkType();
    const address = publicKeyToAddress(pubkey, addressType, networkType);
    const _account: Account = {
      pubkey,
      address,
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

  getAlianName = (pubkey: string) => {
    const contactName = contactBookService.getContactByAddress(pubkey)?.name;
    return contactName;
  };

  updateAlianName = (pubkey: string, name: string) => {
    contactBookService.updateAlias({
      name,
      address: pubkey
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

    // emit accountsChanged event
    const account = preferenceService.getCurrentAccount();
    if (account) {
      const addressType = preferenceService.getAddressType();
      const networkType = preferenceService.getNetworkType();
      account.address = publicKeyToAddress(account.pubkey, addressType, networkType);
    }
    preferenceService.setCurrentAccount(account);
  };

  getAddress = () => {
    const account = preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');
    const addressType = this.getAddressType();
    const networkType = this.getNetworkType();
    return publicKeyToAddress(account.pubkey, addressType, networkType);
  };

  getNetworkType = () => {
    const networkType = preferenceService.getNetworkType();
    return networkType;
  };

  setNetworkType = (networkType: NetworkType) => {
    preferenceService.setNetworkType(networkType);
    if (networkType === NetworkType.MAINNET) {
      this.openapi.setHost(OPENAPI_URL_MAINNET);
    } else {
      this.openapi.setHost(OPENAPI_URL_TESTNET);
    }
    const network = this.getNetworkName();
    sessionService.broadcastEvent('networkChanged', {
      network
    });

    // emit accountsChanged event
    const account = preferenceService.getCurrentAccount();
    if (account) {
      const addressType = preferenceService.getAddressType();
      const networkType = preferenceService.getNetworkType();
      account.address = publicKeyToAddress(account.pubkey, addressType, networkType);
    }
    preferenceService.setCurrentAccount(account);
  };

  getNetworkName = () => {
    const networkType = preferenceService.getNetworkType();
    return NETWORK_TYPES[networkType].name;
  };

  sendBTC = async ({ to, amount, utxos }: { to: string; amount: number; utxos: UTXO[] }) => {
    const account = preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const networkType = this.getNetworkType();
    const psbtNetwork = toPsbtNetwork(networkType);

    const psbt = await createSendBTC({
      utxos: utxos.map((v) => {
        return {
          txId: v.txId,
          outputIndex: v.outputIndex,
          satoshis: v.satoshis,
          scriptPk: v.scriptPk,
          addressType: v.addressType,
          address: account.address,
          ords: v.inscriptions
        };
      }),
      toAddress: to,
      toAmount: amount,
      wallet: this,
      network: psbtNetwork,
      changeAddress: account.address
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
    return psbt.toHex();
  };

  sendInscription = async ({ to, inscriptionId, utxos }: { to: string; inscriptionId: string; utxos: UTXO[] }) => {
    const account = await preferenceService.getCurrentAccount();
    if (!account) throw new Error('no current account');

    const networkType = preferenceService.getNetworkType();
    const psbtNetwork = toPsbtNetwork(networkType);

    const psbt = await createSendOrd({
      utxos: utxos.map((v) => {
        return {
          txId: v.txId,
          outputIndex: v.outputIndex,
          satoshis: v.satoshis,
          scriptPk: v.scriptPk,
          addressType: v.addressType,
          address: account.address,
          ords: v.inscriptions
        };
      }),
      toAddress: to,
      toOrdId: inscriptionId,
      wallet: this,
      network: psbtNetwork,
      changeAddress: account.address
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
    return psbt.toHex();
  };

  pushTx = async (rawtx: string) => {
    const txid = await this.openapi.pushTx(rawtx);
    return txid;
  };

  getAccounts = async () => {
    const keyringAccounts = await keyringService.getAllVisibleAccountsArray();
    const accounts: Account[] = [];
    const addressType = preferenceService.getAddressType();
    const networkType = preferenceService.getNetworkType();
    for (let i = 0; i < keyringAccounts.length; i++) {
      const keyringAccount = keyringAccounts[i];
      const pubkey = keyringAccount.address;
      const alianName = this.getAlianName(pubkey) || (await this.getNewAccountAlianName(keyringAccount.type, i + 1));
      const address = publicKeyToAddress(pubkey, addressType, networkType);
      accounts.push({
        type: keyringAccount.type,
        pubkey,
        address,
        brandName: keyringAccount.brandName,
        alianName
      });
    }

    return accounts;
  };

  getCurrentAccount = async () => {
    let account = preferenceService.getCurrentAccount();
    if (account) {
      const accounts = await this.getAccounts();
      const matchAcct = accounts.find((acct) => account!.pubkey === acct.pubkey);
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

  getConnectedSite = permissionService.getConnectedSite;
  getSite = permissionService.getSite;
  getConnectedSites = permissionService.getConnectedSites;
  setRecentConnectedSites = (sites: ConnectedSite[]) => {
    permissionService.setRecentConnectedSites(sites);
  };
  getRecentConnectedSites = () => {
    return permissionService.getRecentConnectedSites();
  };
  getCurrentSite = (tabId: number): ConnectedSite | null => {
    const { origin, name, icon } = sessionService.getSession(tabId) || {};
    if (!origin) {
      return null;
    }
    const site = permissionService.getSite(origin);
    if (site) {
      return site;
    }
    return {
      origin,
      name,
      icon,
      chain: CHAINS_ENUM.BTC,
      isConnected: false,
      isSigned: false,
      isTop: false
    };
  };
  getCurrentConnectedSite = (tabId: number) => {
    const { origin } = sessionService.getSession(tabId) || {};
    return permissionService.getWithoutUpdate(origin);
  };
  setSite = (data: ConnectedSite) => {
    permissionService.setSite(data);
    if (data.isConnected) {
      const network = this.getNetworkName();
      sessionService.broadcastEvent(
        'networkChanged',
        {
          network
        },
        data.origin
      );
    }
  };
  updateConnectSite = (origin: string, data: ConnectedSite) => {
    permissionService.updateConnectSite(origin, data);
    const network = this.getNetworkName();
    sessionService.broadcastEvent(
      'networkChanged',
      {
        network
      },
      data.origin
    );
  };
  removeAllRecentConnectedSites = () => {
    const sites = permissionService.getRecentConnectedSites().filter((item) => !item.isTop);
    sites.forEach((item) => {
      this.removeConnectedSite(item.origin);
    });
  };
  removeConnectedSite = (origin: string) => {
    sessionService.broadcastEvent('accountsChanged', [], origin);
    permissionService.removeConnectedSite(origin);
  };
}

export default new WalletController();
