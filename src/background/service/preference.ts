import compareVersions from 'compare-versions';
import cloneDeep from 'lodash/cloneDeep';

import { createPersistStore } from '@/background/utils';
import { AddressFlagType, CHAINS, ChainType, DEFAULT_LOCKTIME_ID, EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { SessionEvent } from '@/shared/interfaces/SessionEvent';
import { Account, AddressType, AppSummary, BitcoinBalance, NetworkType, TxHistoryItem } from '@/shared/types';

import browser from '../webapi/browser';
import { i18n, sessionService } from './index';


const version = process.env.release ?? '0';

export type WalletSaveList = [];

export interface PreferenceStore {
    currentKeyringIndex: number;
    currentAccount: Account | undefined | null;
    externalLinkAck: boolean;
    balanceMap: Record<string, BitcoinBalance>;
    historyMap: Record<string, TxHistoryItem[]>;
    locale: string;
    watchAddressPreference: Record<string, number>;
    walletSavedList: WalletSaveList;
    alianNames?: Record<string, string>;
    initAlianNames: boolean;
    currentVersion: string;
    firstOpen: boolean;
    currency: string;
    addressType: AddressType;
    networkType: NetworkType;
    chainType: ChainType;
    keyringAlianNames: Record<string, string>;
    accountAlianNames: Record<string, string>;
    editingKeyringIndex: number;
    editingAccount: Account | undefined | null;
    skippedVersion: string;
    appTab: {
        summary: AppSummary;
        readTabTime: number;
        readAppTime: Record<string, number>;
    };
    showSafeNotice: boolean;
    addressFlags: Record<string, number>;
    enableSignData: boolean;
    autoLockTimeId: number;
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
                networkType: NetworkType.REGTEST, // TODO: To change to mainnet when mainnet is ready
                chainType: ChainType.BITCOIN_REGTEST, // TODO: To change to mainnet when mainnet is ready
                keyringAlianNames: {},
                accountAlianNames: {},
                skippedVersion: '',
                appTab: {
                    summary: { apps: [] },
                    readAppTime: {},
                    readTabTime: 1
                },
                showSafeNotice: true,
                addressFlags: {},
                enableSignData: false,
                autoLockTimeId: DEFAULT_LOCKTIME_ID
            }
        });
        if (!this.store.locale || this.store.locale !== defaultLang) {
            this.store.locale = defaultLang;
        }
        void i18n.changeLanguage(this.store.locale);

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
            this.store.networkType = NetworkType.REGTEST; // default to regtest
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

        if (!this.store.skippedVersion) {
            this.store.skippedVersion = '';
        }

        if (!this.store.appTab) {
            this.store.appTab = { summary: { apps: [] }, readTabTime: 1, readAppTime: {} };
        }

        if (!this.store.appTab.readAppTime) {
            this.store.appTab.readAppTime = {};
        }

        if (typeof this.store.showSafeNotice !== 'boolean') {
            this.store.showSafeNotice = true;
        }
        if (!this.store.addressFlags) {
            this.store.addressFlags = {};
        }

        if (typeof this.store.enableSignData !== 'boolean') {
            this.store.enableSignData = false;
        }

        if (!this.store.chainType) {
            this.store.chainType = ChainType.BITCOIN_REGTEST;
        }

        if (typeof this.store.autoLockTimeId !== 'number') {
            this.store.autoLockTimeId = DEFAULT_LOCKTIME_ID;
        }
    };

    getAcceptLanguages = async () => {
        let langs = await browser.i18n.getAcceptLanguages();
        if (!langs) langs = [];
        return langs
            .map((lang: string) => lang.replace(/-/g, '_'))
            .filter((lang: string) => SUPPORT_LOCALES.includes(lang));
    };

    getCurrentAccount = () => {
        return cloneDeep(this.store.currentAccount);
    };

    setCurrentAccount = (account?: Account | null) => {
        this.store.currentAccount = account;
        if (account) {
            sessionService.broadcastEvent(SessionEvent.accountsChanged, [account.address]);
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
            // Since we're already checking if the key exists, we can disable this eslint error
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
            // Since we're already checking if the key exists, we can disable this eslint error
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

    setLocale = async (locale: string) => {
        this.store.locale = locale;
        await i18n.changeLanguage(locale);
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

    // // network type
    // getNetworkType = () => {
    //   return this.store.networkType;
    // };

    // setNetworkType = (networkType: NetworkType) => {
    //   this.store.networkType = networkType;
    // };

    // chain type
    getChainType = (): ChainType => {
        if (!this.store) {
            throw new Error('Preference store is not initialized');
        }

        if (!CHAINS.find((chain) => chain.enum === this.store.chainType)) {
            this.store.chainType = ChainType.BITCOIN_REGTEST;
        }

        return this.store.chainType;
    };

    setChainType = (chainType: ChainType) => {
        this.store.chainType = chainType;
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

    // get address flag
    getAddressFlag = (address: string) => {
        return this.store.addressFlags[address] || 0;
    };
    setAddressFlag = (address: string, flag: number) => {
        this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: flag });
    };

    // Add address flag
    addAddressFlag = (address: string, flag: AddressFlagType) => {
        const finalFlag = (this.store.addressFlags[address] || 0) | flag;
        this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: finalFlag });
        return finalFlag;
    };

    // Remove address flag
    removeAddressFlag = (address: string, flag: AddressFlagType) => {
        const finalFlag = (this.store.addressFlags[address] || 0) & ~flag;
        this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: finalFlag });
        return finalFlag;
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

    getSkippedVersion = () => {
        return this.store.skippedVersion;
    };

    setSkippedVersion = (version: string) => {
        this.store.skippedVersion = version;
    };

    getAppTab = () => {
        return this.store.appTab;
    };

    setAppSummary = (appSummary: AppSummary) => {
        this.store.appTab.summary = appSummary;
    };

    setReadTabTime = (timestamp: number) => {
        this.store.appTab.readTabTime = timestamp;
    };

    setReadAppTime = (appid: number, timestamp: number) => {
        this.store.appTab.readAppTime[appid] = timestamp;
    };

    getShowSafeNotice = () => {
        return this.store.showSafeNotice;
    };
    setShowSafeNotice = (showSafeNotice: boolean) => {
        this.store.showSafeNotice = showSafeNotice;
    };

    getEnableSignData = () => {
        return this.store.enableSignData;
    };

    setEnableSignData = (enableSignData: boolean) => {
        this.store.enableSignData = enableSignData;
    };

    getAutoLockTimeId = () => {
        return this.store.autoLockTimeId;
    };

    setAutoLockTimeId = (id: number) => {
        this.store.autoLockTimeId = id;
    };
}

export default new PreferenceService();
