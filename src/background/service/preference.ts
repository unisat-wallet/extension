import compareVersions from 'compare-versions';
import cloneDeep from 'lodash/cloneDeep';

import { createPersistStore } from '@/background/utils';
import { EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import {
  Account,
  AddressTokenSummary,
  AddressType,
  BitcoinBalance,
  Inscription,
  NetworkType,
  TokenBalance,
  TokenTransfer,
  TxHistoryItem
} from '@/shared/types';

import browser from '../webapi/browser';
import { i18n, sessionService } from './index';

const version = process.env.release || '0';

export interface PreferenceStore {
  currentKeyringIndex: number;
  currentAccount: Account | undefined | null;
  externalLinkAck: boolean;
  balanceMap: {
    [address: string]: BitcoinBalance;
  };
  historyMap: {
    [address: string]: TxHistoryItem[];
  };
  locale: string;
  watchAddressPreference: Record<string, number>;
  walletSavedList: [];
  alianNames?: Record<string, string>;
  initAlianNames: boolean;
  currentVersion: string;
  firstOpen: boolean;
  currency: string;
  addressType: AddressType;
  networkType: NetworkType;
  keyringAlianNames: {
    [key: string]: string;
  };
  accountAlianNames: {
    [key: string]: string;
  };
  editingKeyringIndex: number;
  editingAccount: Account | undefined | null;
  uiCachedData: {
    [address: string]: {
      allInscriptionList: {
        currentPage: number;
        pageSize: number;
        total: number;
        list: Inscription[];
      }[];
      brc20List: {
        currentPage: number;
        pageSize: number;
        total: number;
        list: TokenBalance[];
      }[];
      brc20Summary: {
        [ticker: string]: AddressTokenSummary;
      };
      brc20TransferableList: {
        [ticker: string]: {
          currentPage: number;
          pageSize: number;
          total: number;
          list: TokenTransfer[];
        }[];
      };
    };
  };
}

const SUPPORT_LOCALES = ['en'];

class PreferenceService {
  store!: PreferenceStore;
  popupOpen = false;
  hasOtherProvider = false;

  init = async () => {
    const defaultLang = 'en';
    this.store = await createPersistStore<PreferenceStore>({
      name: 'preference',
      template: {
        currentKeyringIndex: 0,
        currentAccount: undefined,
        editingKeyringIndex: 0,
        editingAccount: undefined,
        externalLinkAck: false,
        balanceMap: {},
        historyMap: {},
        locale: defaultLang,
        watchAddressPreference: {},
        walletSavedList: [],
        alianNames: {},
        initAlianNames: false,
        currentVersion: '0',
        firstOpen: false,
        currency: 'USD',
        addressType: AddressType.P2WPKH,
        networkType: NetworkType.MAINNET,
        keyringAlianNames: {},
        accountAlianNames: {},
        uiCachedData: {}
      }
    });
    if (!this.store.locale || this.store.locale !== defaultLang) {
      this.store.locale = defaultLang;
    }
    i18n.changeLanguage(this.store.locale);

    if (!this.store.currency) {
      this.store.currency = 'USD';
    }

    if (!this.store.initAlianNames) {
      this.store.initAlianNames = false;
    }
    if (!this.store.externalLinkAck) {
      this.store.externalLinkAck = false;
    }

    if (!this.store.balanceMap) {
      this.store.balanceMap = {};
    }

    if (!this.store.historyMap) {
      this.store.historyMap = {};
    }

    if (!this.store.walletSavedList) {
      this.store.walletSavedList = [];
    }

    if (this.store.addressType === undefined || this.store.addressType === null) {
      this.store.addressType = AddressType.P2WPKH;
    }

    if (!this.store.networkType) {
      this.store.networkType = NetworkType.MAINNET;
    }

    if (this.store.currentAccount) {
      if (!this.store.currentAccount.pubkey) {
        // old version.
        this.store.currentAccount = undefined; // will restored to new version
      }
    }

    if (!this.store.keyringAlianNames) {
      this.store.keyringAlianNames = {};
    }

    if (!this.store.accountAlianNames) {
      this.store.accountAlianNames = {};
    }

    if (!this.store.uiCachedData) {
      this.store.uiCachedData = {};
    }
  };

  getAcceptLanguages = async () => {
    let langs = await browser.i18n.getAcceptLanguages();
    if (!langs) langs = [];
    return langs.map((lang) => lang.replace(/-/g, '_')).filter((lang) => SUPPORT_LOCALES.includes(lang));
  };

  getCurrentAccount = () => {
    return cloneDeep(this.store.currentAccount);
  };

  setCurrentAccount = (account?: Account | null) => {
    this.store.currentAccount = account;
    if (account) {
      sessionService.broadcastEvent('accountsChanged', [account.address]);
      eventBus.emit(EVENTS.broadcastToUI, {
        method: 'accountsChanged',
        params: account
      });
    }
  };

  // popupOpen
  setPopupOpen = (isOpen: boolean) => {
    this.popupOpen = isOpen;
  };

  getPopupOpen = () => {
    return this.popupOpen;
  };

  // addressBalance
  updateAddressBalance = (address: string, data: BitcoinBalance) => {
    const balanceMap = this.store.balanceMap || {};
    this.store.balanceMap = {
      ...balanceMap,
      [address]: data
    };
  };

  removeAddressBalance = (address: string) => {
    const key = address;
    if (key in this.store.balanceMap) {
      const map = this.store.balanceMap;
      delete map[key];
      this.store.balanceMap = map;
    }
  };

  getAddressBalance = (address: string): BitcoinBalance | null => {
    const balanceMap = this.store.balanceMap || {};
    return balanceMap[address] || null;
  };

  // addressHistory
  updateAddressHistory = (address: string, data: TxHistoryItem[]) => {
    const historyMap = this.store.historyMap || {};
    this.store.historyMap = {
      ...historyMap,
      [address]: data
    };
  };

  removeAddressHistory = (address: string) => {
    const key = address;
    if (key in this.store.historyMap) {
      const map = this.store.historyMap;
      delete map[key];
      this.store.historyMap = map;
    }
  };

  getAddressHistory = (address: string): TxHistoryItem[] => {
    const historyMap = this.store.historyMap || {};
    return historyMap[address] || [];
  };

  // externalLinkAck
  getExternalLinkAck = (): boolean => {
    return this.store.externalLinkAck;
  };

  setExternalLinkAck = (ack = false) => {
    this.store.externalLinkAck = ack;
  };

  // locale
  getLocale = () => {
    return this.store.locale;
  };

  setLocale = (locale: string) => {
    this.store.locale = locale;
    i18n.changeLanguage(locale);
  };

  // currency
  getCurrency = () => {
    return this.store.currency;
  };

  setCurrency = (currency: string) => {
    this.store.currency = currency;
  };

  // walletSavedList
  getWalletSavedList = () => {
    return this.store.walletSavedList || [];
  };

  updateWalletSavedList = (list: []) => {
    this.store.walletSavedList = list;
  };

  // alianNames
  getInitAlianNameStatus = () => {
    return this.store.initAlianNames;
  };

  changeInitAlianNameStatus = () => {
    this.store.initAlianNames = true;
  };

  // isFirstOpen
  getIsFirstOpen = () => {
    if (!this.store.currentVersion || compareVersions(version, this.store.currentVersion)) {
      this.store.currentVersion = version;
      this.store.firstOpen = true;
    }
    return this.store.firstOpen;
  };

  updateIsFirstOpen = () => {
    this.store.firstOpen = false;
  };

  // deprecate
  getAddressType = () => {
    return this.store.addressType;
  };

  // network type
  getNetworkType = () => {
    return this.store.networkType;
  };

  setNetworkType = (networkType: NetworkType) => {
    this.store.networkType = networkType;
  };

  // currentKeyringIndex
  getCurrentKeyringIndex = () => {
    return this.store.currentKeyringIndex;
  };

  setCurrentKeyringIndex = (keyringIndex: number) => {
    this.store.currentKeyringIndex = keyringIndex;
  };

  // keyringAlianNames
  setKeyringAlianName = (keyringKey: string, name: string) => {
    this.store.keyringAlianNames = Object.assign({}, this.store.keyringAlianNames, { [keyringKey]: name });
  };

  getKeyringAlianName = (keyringKey: string, defaultName?: string) => {
    const name = this.store.keyringAlianNames[keyringKey];
    if (!name && defaultName) {
      this.store.keyringAlianNames[keyringKey] = defaultName;
    }
    return this.store.keyringAlianNames[keyringKey];
  };

  // accountAlianNames
  setAccountAlianName = (accountKey: string, name: string) => {
    this.store.accountAlianNames = Object.assign({}, this.store.accountAlianNames, { [accountKey]: name });
  };

  getAccountAlianName = (accountKey: string, defaultName?: string) => {
    const name = this.store.accountAlianNames[accountKey];
    if (!name && defaultName) {
      this.store.accountAlianNames[accountKey] = defaultName;
    }
    return this.store.accountAlianNames[accountKey];
  };

  // editingKeyringIndex
  getEditingKeyringIndex = () => {
    return this.store.editingKeyringIndex;
  };

  setEditingKeyringIndex = (keyringIndex: number) => {
    this.store.editingKeyringIndex = keyringIndex;
  };

  // editingAccount
  getEditingAccount = () => {
    return cloneDeep(this.store.editingAccount);
  };

  setEditingAccount = (account?: Account | null) => {
    this.store.editingAccount = account;
  };

  getUICachedData = (address: string) => {
    this.store.uiCachedData[address] = {
      allInscriptionList: [],
      brc20List: [],
      brc20Summary: {},
      brc20TransferableList: {}
    };

    // if (!this.store.uiCachedData[address]) {
    //   this.store.uiCachedData[address] = {
    //     allInscriptionList: [],
    //     brc20List: [],
    //     brc20Summary: {},
    //     brc20TransferableList: {}
    //   };
    // }
    return this.store.uiCachedData[address];
  };

  expireUICachedData = (address: string) => {
    this.store.uiCachedData[address] = {
      allInscriptionList: [],
      brc20List: [],
      brc20Summary: {},
      brc20TransferableList: {}
    };
  };
}

export default new PreferenceService();
