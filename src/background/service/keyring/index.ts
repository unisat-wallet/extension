/// fork from https://github.com/MetaMask/KeyringController/blob/master/index.js
import * as bip39 from 'bip39';
import * as oldEncryptor from 'browser-passworder';
import { EventEmitter } from 'events';
import log from 'loglevel';

import { ADDRESS_TYPES, KEYRING_TYPE } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { networks } from '@btc-vision/bitcoin';
import { Network } from '@btc-vision/bitcoin/src/networks.js';
import * as encryptor from '@btc-vision/passworder';
import { DeserializeOption, DeserializeOptionKeystone, HdKeyring, IKeyringBase, KeyringOptions, KeystoneKeyring, SimpleKeyring, SimpleKeyringOptions } from '@btc-vision/wallet-sdk';
import { bitcoin } from '@btc-vision/wallet-sdk/lib/bitcoin-core';
import { ObservableStore } from '@metamask/obs-store';

// TODO (typing): The below was the original version, how does this work although these files do not exist.
// import {
//     DeserializeOption,
//     DeserializeOptionKeystone,
//     KeyringOptions,
//     SimpleKeyringOptions
// } from '../../../../../wallet-sdk/src';
import i18n from '../i18n';
import preference from '../preference';
import DisplayKeyring from './display';

export interface SavedVault {
    type: string;
    data: KeyringOptions;
    addressType: AddressType;
}

export const KEYRING_SDK_TYPES = {
    SimpleKeyring,
    HdKeyring,
    KeystoneKeyring
};

interface MemStoreState {
    isUnlocked: boolean;
    keyringTypes: string[];
    keyrings: DisplayedKeyring[];
    preMnemonics: string;
}

export interface DisplayedKeyring {
    type: string;
    accounts: {
        pubkey: string;
        brandName: string;
        type?: string;
        keyring?: DisplayKeyring;
        alianName?: string;
    }[];
    keyring: DisplayKeyring;
    addressType: AddressType;
    index: number;
}

export interface ToSignInput {
    index: number;
    publicKey: string;
}

export type Keyring =
    | IKeyringBase<SimpleKeyringOptions>
    | IKeyringBase<DeserializeOption>
    | IKeyringBase<DeserializeOptionKeystone>
    | IKeyringBase<{ network: Network }>;

/*export interface Keyring {
    type: string;
    mfp?: string;
    accounts?: string[];

    serialize(): Promise<any>;

    deserialize(opts: any): Promise<void>;

    addAccounts(n: number): Promise<string[]>;

    getAccounts(): Promise<string[]>;

    signTransaction(psbt: bitcoin.Psbt, inputs: ToSignInput[]): Promise<bitcoin.Psbt>;

    signInteraction(interactionParameters: InteractionParametersWithoutSigner): Promise<any>;

    wrap(IUnwrapParameters: IWrapParametersWithoutSigner): Promise<any>;

    signAndBroadcastInteraction(interactionParameters: InteractionParametersWithoutSigner): Promise<any>;

    signMessage(address: string, message: string): Promise<string>;

    signData(address: string, data: string, type: string): Promise<string>;

    verifyMessage(address: string, message: string, sig: string): Promise<boolean>;

    exportAccount(address: string): Promise<string>;

    removeAccount(address: string): void;

    unlock?(): Promise<void>;

    getFirstPage?(): Promise<{ address: string; index: number }[]>;

    getNextPage?(): Promise<{ address: string; index: number }[]>;

    getPreviousPage?(): Promise<{ address: string; index: number }[]>;

    getAddresses?(start: number, end: number): { address: string; index: number }[];

    getIndexByAddress?(address: string): number;

    getAccountsWithBrand?(): { address: string; index: number }[];

    activeAccounts?(indexes: number[]): string[];

    changeHdPath?(hdPath: string): void;

    getAccountByHdPath?(hdPath: string, index: number): string;

    genSignPsbtUr?(psbtHex: string): Promise<{ type: string; cbor: string }>;

    parseSignPsbtUr?(type: string, cbor: string): Promise<string>;

    genSignMsgUr?(publicKey: string, text: string): Promise<{ type: string; cbor: string; requestId: string }>;

    parseSignMsgUr?(type: string, cbor: string): Promise<{ requestId: string; publicKey: string; signature: string }>;
}*/

// TODO (typing): signInteraction, wrap and signAndBroadcastInteraction functions of EmptyKeyring and KeyringService are not used explicity.
// For now, removed those functions from both EmptyKeyring and KeyringService classes.
// If there is any reason for keeping them we should undo removing.
class EmptyKeyring extends IKeyringBase<{ network: Network }> {
    static type = KEYRING_TYPE.Empty;
    type = KEYRING_TYPE.Empty;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    addAccounts(n: number): string[] {
        return [];
    }

    getAccounts(): string[] {
        return [];
    }

    signTransaction(psbt: bitcoin.Psbt, inputs: ToSignInput[]): bitcoin.Psbt {
        throw new Error('Method not implemented.');
    }

    signMessage(address: string, message: string): string {
        throw new Error('Method not implemented.');
    }

    verifyMessage(address: string, message: string, sig: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    public signData(publicKey: string, data: string, type: 'ecdsa' | 'schnorr' = 'ecdsa'): string {
        throw new Error('Method not implemented.');
    }

    exportAccount(address: string): string {
        throw new Error('Method not implemented.');
    }

    removeAccount(address: string): void {
        throw new Error('Method not implemented.');
    }

    serialize(): { network: Network } {
        return { network: this.network };
    }

    deserialize(opts: unknown) {
        return;
    }
}

export interface StoredData {
    booted: string;
    vault: string;
}

class KeyringService extends EventEmitter {
    //
    // PUBLIC METHODS
    //
    keyringTypes: (typeof IKeyringBase)[];
    store!: ObservableStore<StoredData>;
    memStore: ObservableStore<MemStoreState>;
    keyrings: Keyring[];
    addressTypes: AddressType[];
    encryptor: typeof encryptor = encryptor;
    password: string | null = null;

    constructor() {
        super();
        this.keyringTypes = Object.values(KEYRING_SDK_TYPES) as (typeof IKeyringBase)[];
        this.memStore = new ObservableStore({
            isUnlocked: false,
            keyringTypes: this.keyringTypes.map((krt) => krt.type),
            keyrings: [],
            preMnemonics: '',
            addressTypes: [],
            keystone: null
        });

        this.keyrings = [];
        this.addressTypes = [];
    }

    loadStore = (initState: StoredData) => {
        this.store = new ObservableStore(initState);
    };

    boot = async (password: string) => {
        this.password = password;

        const encryptBooted = await this.encryptor.encrypt(password, 'true');

        this.store.updateState({ booted: encryptBooted });
        this.memStore.updateState({ isUnlocked: true });
    };

    isBooted = () => {
        return !!this.store.getState().booted;
    };

    hasVault = () => {
        return !!this.store.getState().vault;
    };

    /**
     * Full Update
     *
     * Emits the `update` event and @returns a Promise that resolves to
     * the current state.
     *
     * Frequently used to end asynchronous chains in this class,
     * indicating consumers can often either listen for updates,
     * or accept a state-resolving promise to consume their results.
     *
     * @returns {Object} The controller state.
     */
    fullUpdate = (): MemStoreState => {
        this.emit('update', this.memStore.getState());
        return this.memStore.getState();
    };

    /**
     * Import Keychain using Private key
     *
     * @returns  A Promise that resolves to the state.
     */
    importPrivateKey = async (
        privateKey: string,
        addressType: AddressType,
        network: networks.Network = networks.bitcoin
    ) => {
        privateKey = privateKey.replace('0x', '');

        await this.persistAllKeyrings();

        const keyring = await this.addNewKeyring(
            'Simple Key Pair',
            {
                privateKeys: [privateKey],
                network
            },
            addressType
        );

        await this.persistAllKeyrings();
        this.setUnlocked();
        this.fullUpdate();
        return keyring;
    };

    generatePreMnemonic = async (): Promise<string> => {
        if (!this.password) {
            throw new Error(i18n.t('you need to unlock wallet first'));
        }
        const mnemonic = this.generateMnemonic();
        const preMnemonics = await this.encryptor.encrypt(this.password, mnemonic);
        this.memStore.updateState({ preMnemonics });

        return mnemonic;
    };

    getKeyringByType = (type: string) => {
        return this.keyrings.find((keyring) => keyring.type === type);
    };

    removePreMnemonics = () => {
        this.memStore.updateState({ preMnemonics: '' });
    };

    getPreMnemonics = async (): Promise<SavedVault[] | null> => {
        if (!this.memStore.getState().preMnemonics) {
            return null;
        }

        if (!this.password) {
            throw new Error(i18n.t('you need to unlock wallet first'));
        }

        return (await this.encryptor.decrypt(this.password, this.memStore.getState().preMnemonics)) as SavedVault[];
    };

    /**
     * CreateNewVaultAndRestore Mnenoic
     *
     * Destroys any old encrypted storage,
     * creates a new HD wallet from the given seed with 1 account.
     *
     * @emits KeyringController#unlock
     * @param  seed - The BIP44-compliant seed phrase.
     * @returns  A Promise that resolves to the state.
     */
    createKeyringWithMnemonics = async (
        seed: string,
        hdPath: string,
        passphrase: string,
        addressType: AddressType,
        accountCount: number
    ) => {
        if (accountCount < 1) {
            throw new Error(i18n.t('account count must be greater than 0'));
        }

        if (!bip39.validateMnemonic(seed)) {
            return Promise.reject(new Error(i18n.t('mnemonic phrase is invalid')));
        }

        await this.persistAllKeyrings();
        const activeIndexes: number[] = [];
        for (let i = 0; i < accountCount; i++) {
            activeIndexes.push(i);
        }

        const keyring = await this.addNewKeyring(
            'HD Key Tree',
            {
                mnemonic: seed,
                activeIndexes,
                hdPath,
                passphrase
            },
            addressType
        );

        const accounts = keyring.getAccounts();
        if (!accounts[0]) {
            throw new Error('KeyringController - First Account not found.');
        }

        await this.persistAllKeyrings();
        this.setUnlocked();
        this.fullUpdate();
        return keyring;
    };

    createKeyringWithKeystone = async (
        urType: string,
        urCbor: string,
        addressType: AddressType,
        hdPath: string,
        accountCount: number
    ) => {
        if (accountCount < 1) {
            throw new Error(i18n.t('account count must be greater than 0'));
        }
        await this.persistAllKeyrings();
        const tmpKeyring = new KeystoneKeyring();
        await tmpKeyring.initFromUR(urType, urCbor);
        if (hdPath.length >= 13) {
            tmpKeyring.changeChangeAddressHdPath(hdPath);
            tmpKeyring.addAccounts(accountCount);
        } else {
            tmpKeyring.changeHdPath(ADDRESS_TYPES[addressType].hdPath);
            tmpKeyring.addAccounts(accountCount);
        }

        const opts = tmpKeyring.serialize();
        const keyring = await this.addNewKeyring(KEYRING_TYPE.KeystoneKeyring, opts, addressType);
        const accounts = keyring.getAccounts();

        if (!accounts[0]) {
            throw new Error('KeyringController - First Account not found.');
        }
        this.setUnlocked();
        return keyring;
    };

    addKeyring = async (keyring: Keyring, addressType: AddressType) => {
        //const accounts = keyring.getAccounts();
        //this.checkForDuplicate(keyring.type, accounts);

        this.keyrings.push(keyring);

        this.addressTypes.push(addressType);
        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
        return keyring;
    };

    changeAddressType = async (keyringIndex: number, addressType: AddressType) => {
        const keyring: Keyring = this.keyrings[keyringIndex];

        // TODO: IMPORTANT, ADD A SETTING TO ENABLE THIS. (keyring-mnemonic)
        /*if (keyring.type === KEYRING_TYPE.HdKeyring || keyring.type === KEYRING_TYPE.KeystoneKeyring) {
            const hdPath = ADDRESS_TYPES[addressType].hdPath;
            if ((keyring as KeystoneKeyring).hdPath !== hdPath && 'changeHdPath' in keyring) {
                console.log('changeHdPath', hdPath);
                (keyring as KeystoneKeyring).changeHdPath(hdPath);
            }
        }*/

        this.addressTypes[keyringIndex] = addressType;
        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
        return keyring;
    };

    /**
     * Set Locked
     * This method deallocates all secrets, and effectively locks MetaMask.
     *
     * @emits KeyringController#lock
     * @returns {Promise<Object>} A Promise that resolves to the state.
     */
    setLocked = async (): Promise<MemStoreState> => {
        // set locked
        this.password = null;
        this.memStore.updateState({ isUnlocked: false });
        // remove keyrings
        this.keyrings = [];
        this.addressTypes = [];
        await this._updateMemStoreKeyrings();
        this.emit('lock');
        return this.fullUpdate();
    };

    /**
     * Submit Password
     *
     * Attempts to decrypt the current vault and load its keyrings
     * into memory.
     *
     * Temporarily also migrates any old-style vaults first, as well.
     * (Pre MetaMask 3.0.0)
     *
     * @emits KeyringController#unlock
     * @param {string} password - The keyring controller password.
     * @returns {Promise<Object>} A Promise that resolves to the state.
     */
    submitPassword = async (password: string): Promise<MemStoreState> => {
        const oldMethod = await this.verifyPassword(password);
        this.password = password;

        try {
            this.keyrings = await this.unlockKeyrings(password, oldMethod);
        } catch (e) {
            if (oldMethod) {
                try {
                    await this.boot(password);

                    this.keyrings = await this.unlockKeyrings(password, false);
                } catch (e) {
                    console.log('unlock failed (new)', e);
                }
            } else {
                console.log('unlock failed', e);
            }
        } finally {
            this.setUnlocked();
        }

        return this.fullUpdate();
    };

    changePassword = async (oldPassword: string, newPassword: string) => {
        const oldMethod = await this.verifyPassword(oldPassword);
        await this.unlockKeyrings(oldPassword, oldMethod);
        this.password = newPassword;

        const encryptBooted = await this.encryptor.encrypt(newPassword, 'true');
        this.store.updateState({ booted: encryptBooted });

        if (this.memStore.getState().preMnemonics) {
            const mnemonic = await this.encryptor.decrypt(oldPassword, this.memStore.getState().preMnemonics);
            const preMnemonics = await this.encryptor.encrypt(newPassword, mnemonic);
            this.memStore.updateState({ preMnemonics });
        }

        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
    };

    /**
     * Verify Password
     *
     * Attempts to decrypt the current vault with a given password
     * to verify its validity.
     *
     * @param {string} password
     */
    verifyPassword = async (password: string): Promise<boolean> => {
        const encryptedBooted = this.store.getState().booted;
        if (!encryptedBooted) {
            throw new Error(i18n.t('Cannot unlock without a previous vault'));
        }

        if (encryptedBooted.includes('keyMetadata')) {
            await this.encryptor.decrypt(password, encryptedBooted);

            return false;
        }

        const isValid = await oldEncryptor.decrypt(password, encryptedBooted);
        return isValid == 'true';
    };

    /**
     * Add New Keyring
     *
     * Adds a new Keyring of the given `type` to the vault
     * and the current decrypted Keyrings array.
     *
     * All Keyring classes implement a unique `type` string,
     * and this is used to retrieve them from the keyringTypes array.
     *
     * @param  type - The type of keyring to add.
     * @param  opts - The constructor options for the keyring.
     * @returns  The new keyring.
     */
    addNewKeyring = async (type: string, opts: KeyringOptions, addressType: AddressType): Promise<Keyring> => {
        const Keyring = this.getKeyringClassForType(type) as typeof SimpleKeyring;
        if (!Keyring) {
            throw new Error(`Keyring type not found ${type}`);
        }

        const keyring = new Keyring(opts);

        return await this.addKeyring(keyring, addressType);
    };

    createTmpKeyring = (type: string, opts: KeyringOptions | undefined): Keyring => {
        const Keyring = this.getKeyringClassForType(type) as typeof SimpleKeyring;
        if (!Keyring) {
            throw new Error(`Keyring type not found ${type}`);
        }

        return new Keyring(opts);
    };

    /**
     * Checks for duplicate keypairs, using the the first account in the given
     * array. Rejects if a duplicate is found.
     *
     * Only supports 'Simple Key Pair'.
     *
     * @param {string} type - The key pair type to check for.
     * @param {Array<string>} newAccountArray - Array of new accounts.
     * @returns {Array<string>} The account, if no duplicate is found.
     */
    checkForDuplicate = (type: string, newAccountArray: string[]): string[] => {
        const keyrings = this.getKeyringsByType(type);
        const _accounts = keyrings.map((keyring) => keyring.getAccounts());
        const accounts: string[] = _accounts.reduce<string[]>((m, n) => m.concat(n), []);

        const isIncluded = newAccountArray.some((account) => {
            return accounts.find((key) => key === account);
        });

        if (isIncluded) {
            throw new Error(i18n.t('Wallet already imported.'));
        }

        return newAccountArray;
    };

    /**
     * Add New Account
     *
     * Calls the `addAccounts` method on the given keyring,
     * and then saves those changes.
     *
     * @param {Keyring} selectedKeyring - The currently selected keyring.
     * @returns {Promise<Object>} A Promise that resolves to the state.
     */
    addNewAccount = async (selectedKeyring: Keyring): Promise<string[]> => {
        const accounts = selectedKeyring.addAccounts(1);
        accounts.forEach((hexAccount) => {
            this.emit('newAccount', hexAccount);
        });
        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
        return accounts;
    };

    /**
     * Export Account
     *
     * Requests the private key from the keyring controlling
     * the specified address.
     *
     * Returns a Promise that may resolve with the private key string.
     *
     * @param {string} address - The address of the account to export.
     * @returns {Promise<string>} The private key of the account.
     */
    exportAccount = (address: string): string => {
        const keyring = this.getKeyringForAccount(address);
        return keyring.exportAccount(address);
    };

    /**
     *
     * Remove Account
     *
     * Removes a specific account from a keyring
     * If the account is the last/only one then it also removes the keyring.
     *
     * @param {string} address - The address of the account to remove.
     * @returns {Promise<void>} A Promise that resolves if the operation was successful.
     */
    removeAccount = async (address: string, type: string, brand?: string): Promise<void> => {
        const keyring = this.getKeyringForAccount(address, type);

        // Not all the keyrings support this, so we have to check
        if (typeof keyring.removeAccount != 'function') {
            throw new Error(`Keyring ${keyring.type} doesn't support account removal operations`);
        }
        keyring.removeAccount(address);
        this.emit('removedAccount', address);
        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
    };

    removeKeyring = async (keyringIndex: number): Promise<void> => {
        this.keyrings.splice(keyringIndex, 1);
        this.keyrings[keyringIndex] = new EmptyKeyring();

        await this.persistAllKeyrings();
        await this._updateMemStoreKeyrings();
        this.fullUpdate();
    };

    /**
     * Sign BTC Transaction
     *
     * Signs an BTC transaction object.
     *
     * @param btcTx - The transaction to sign.
     * @param fromAddress - The transaction 'from' address.
     * @returns  The signed transactio object.
     */
    signTransaction = (keyring: Keyring, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
        return keyring.signTransaction(psbt, inputs);
    };

    //
    // SIGNING METHODS
    //

    /**
     * Sign Message
     *
     * Attempts to sign the provided message parameters.
     */
    signMessage = (address: string, keyringType: string, data: string) => {
        const keyring = this.getKeyringForAccount(address, keyringType);
        return keyring.signMessage(address, data);
    };

    /**
     * Decrypt Message
     *
     * Attempts to verify the provided message parameters.
     */
    verifyMessage = (address: string, data: string, sig: string) => {
        const keyring = this.getKeyringForAccount(address);
        return keyring.verifyMessage(address, data, sig);
    };

    /**
     * Sign Data
     *
     * Sign any content, but note that the content signed by this method is unreadable, so use it with caution.
     *
     */
    signData = (address: string, data: string, type: 'ecdsa' | 'schnorr' = 'ecdsa') => {
        const keyring = this.getKeyringForAccount(address);
        return keyring.signData(address, data, type);
    };

    /**
     * Persist All Keyrings
     *
     * Iterates the current `keyrings` array,
     * serializes each one into a serialized array,
     * encrypts that array with the provided `password`,
     * and persists that encrypted string to storage.
     *
     * @returns {Promise<boolean>} Resolves to true once keyrings are persisted.
     */
    persistAllKeyrings = async (): Promise<boolean> => {
        if (!this.password || typeof this.password !== 'string') {
            return Promise.reject(new Error('KeyringController - password is not a string'));
        }

        const serializedKeyrings = await Promise.all(
            this.keyrings.map(async (keyring, index) => {
                const serializedKeyringArray = await Promise.all([keyring.type, keyring.serialize()]);

                return {
                    type: serializedKeyringArray[0],
                    data: serializedKeyringArray[1],
                    addressType: this.addressTypes[index]
                };
            })
        );

        const encryptedString = await this.encryptor.encrypt(this.password, serializedKeyrings as unknown as Buffer);
        this.store.updateState({ vault: encryptedString });
        return true;
    };

    //
    // PRIVATE METHODS
    //

    /**
     * Unlock Keyrings
     *
     * Attempts to unlock the persisted encrypted storage,
     * initializing the persisted keyrings to RAM.
     *
     * @param {string} password - The keyring controller password.
     * @param {boolean} oldMethod - Whether to use the old method of decrypting the vault.
     * @returns {Promise<IKeyringBase[]>} The keyrings.
     */
    unlockKeyrings = async (password: string, oldMethod: boolean): Promise<Keyring[]> => {
        const encryptedVault = this.store.getState().vault;
        if (!encryptedVault) {
            throw new Error(i18n.t('Cannot unlock without a previous vault'));
        }

        this.clearKeyrings();

        const vault = oldMethod
            ? ((await oldEncryptor.decrypt(password, encryptedVault)) as SavedVault[])
            : ((await this.encryptor.decrypt(password, encryptedVault)) as SavedVault[]);
        for (const key of vault) {
            try {
                const { keyring, addressType } = this._restoreKeyring(key);
        
                this.keyrings.push(keyring);
                this.addressTypes.push(addressType);
            } catch (e) {
                // can not load.
            }
        }
            

        await this._updateMemStoreKeyrings();

        if (oldMethod) {
            await this.persistAllKeyrings();
        }

        return this.keyrings;
    };

    /**
     * Restore Keyring
     *
     * Attempts to initialize a new keyring from the provided serialized payload.
     * On success, updates the memStore keyrings and returns the resulting
     * keyring instance.
     *
     * @param {Object} serialized - The serialized keyring.
     * @returns {Promise<Keyring>} The deserialized keyring.
     */
    restoreKeyring = async (serialized: SavedVault): Promise<Keyring> => {
        const { keyring } = this._restoreKeyring(serialized);
        await this._updateMemStoreKeyrings();
        return keyring;
    };

    /**
     * Restore Keyring Helper
     *
     * Attempts to initialize a new keyring from the provided serialized payload.
     * On success, returns the resulting keyring instance.
     *
     * @param {Object} serialized - The serialized keyring.
     * @returns {keyring: Keyring, addressType: AddressType} The deserialized keyring.
     */
    _restoreKeyring = (
        serialized: SavedVault
    ): {
        keyring: Keyring;
        addressType: AddressType;
    } => {
        const { type, data, addressType } = serialized;
        if (type === KEYRING_TYPE.Empty) {
            const keyring = new EmptyKeyring();
            return { keyring, addressType: addressType === undefined ? preference.getAddressType() : addressType };
        }

        const Keyring = this.getKeyringClassForType(type) as typeof SimpleKeyring;
        if (!Keyring) {
            throw new Error(`Keyring type not found ${type}`);
        }

        const keyring = new Keyring();
        keyring.deserialize(data);

        // getAccounts also validates the accounts for some keyrings
        const accounts = keyring.getAccounts();
        if (!accounts.length) {
            throw new Error('KeyringController - Keyring failed to deserialize');
        }

        return { keyring, addressType: addressType === undefined ? preference.getAddressType() : addressType };
    };

    /**
     * Get Keyring Class For Type
     *
     * Searches the current `keyringTypes` array
     * for a Keyring class whose unique `type` property
     * matches the provided `type`,
     * returning it if it exists.
     *
     * @param {string} type - The type whose class to get.
     * @returns {KeyringType | undefined} The class, if it exists.
     */
    getKeyringClassForType = <T extends typeof IKeyringBase>(type: string): T | undefined => {
        return this.keyringTypes.find((kr) => kr.type === type) as T | undefined;
    };

    /**
     * Get Keyrings by Type
     *
     * Gets all keyrings of the given type.
     *
     * @param {string} type - The keyring types to retrieve.
     * @returns {Array<Keyring>} The keyrings.
     */
    getKeyringsByType = (type: string): Keyring[] => {
        return this.keyrings.filter((keyring) => keyring.type === type);
    };

    /**
     * Get Accounts
     *
     * Returns the public addresses of all current accounts
     * managed by all currently unlocked keyrings.
     *
     * @returns {Promise<Array<string>>} The array of accounts.
     */
    getAccounts = (): string[] => {
        const keyrings = this.keyrings || [];
        let addrs: string[] = [];
        for (const keyring of keyrings) {
            const accounts = keyring.getAccounts();
            addrs = addrs.concat(accounts);
        }        
        return addrs;
    };

    /**
     * Get Keyring For Account
     *
     * Returns the currently initialized keyring that manages
     * the specified `address` if one exists.
     *
     * @param {string} address - An account address.
     * @returns {Keyring} The keyring of the account, if it exists.
     */
    getKeyringForAccount = (
        pubkey: string,
        type?: string,
        start?: number,
        end?: number,
        includeWatchKeyring = true
    ): Keyring => {
        log.debug(`KeyringController - getKeyringForAccount: ${pubkey}`);
        const keyrings = type ? this.keyrings.filter((keyring) => keyring.type === type) : this.keyrings;
        for (const keyring of keyrings) {
            const accounts = keyring.getAccounts();
            if (accounts.includes(pubkey)) {
                return keyring;
            }
        }

        throw new Error('No keyring found for the requested account.');
    };

    /**
     * Display For Keyring
     *
     * Is used for adding the current keyrings to the state object.
     * @param {Keyring} keyring
     * @returns {Object} A keyring display object, with type and accounts properties.
     */
    displayForKeyring = (keyring: Keyring, addressType: AddressType, index: number): DisplayedKeyring => {
        const accounts = keyring.getAccounts();
        const all_accounts: { pubkey: string; brandName: string }[] = [];
        for (const pubkey of accounts) {
            all_accounts.push({
                pubkey,
                brandName: keyring.type
            });
        }        
        return {
            type: keyring.type,
            accounts: all_accounts,
            keyring: new DisplayKeyring(keyring),
            addressType,
            index
        };
    };

    getAllDisplayedKeyrings = (): Promise<DisplayedKeyring[]> => {
        return Promise.all(
            this.keyrings.map((keyring, index) => this.displayForKeyring(keyring, this.addressTypes[index], index))
        );
    };

    getAllVisibleAccountsArray = async () => {
        const typedAccounts = await this.getAllDisplayedKeyrings();
        const result: { pubkey: string; type: string; brandName: string }[] = [];
        typedAccounts.forEach((accountGroup) => {
            result.push(
                ...accountGroup.accounts.map((account) => ({
                    pubkey: account.pubkey,
                    brandName: account.brandName,
                    type: accountGroup.type
                }))
            );
        });

        return result;
    };

    getAllPubkeys = async () => {
        const keyrings = await this.getAllDisplayedKeyrings();
        const result: { pubkey: string; type: string; brandName: string }[] = [];
        keyrings.forEach((accountGroup) => {
            result.push(
                ...accountGroup.accounts.map((account) => ({
                    pubkey: account.pubkey,
                    brandName: account.brandName,
                    type: accountGroup.type
                }))
            );
        });

        return result;
    };

    hasPubkey = async (pubkey: string) => {
        const addresses = await this.getAllPubkeys();
        return !!addresses.find((item) => item.pubkey === pubkey);
    };

     
    clearKeyrings = (): void => {
        // clear keyrings from memory
        this.keyrings = [];
        this.addressTypes = [];
        this.memStore.updateState({
            keyrings: []
        });
    };

    /**
     * Clear Keyrings
     *
     * Deallocates all currently managed keyrings and accounts.
     * Used before initializing a new vault.
     */

    /**
     * Update Memstore Keyrings
     *
     * Updates the in-memory keyrings, without persisting.
     */
    _updateMemStoreKeyrings = async (): Promise<void> => {
        const keyrings = await Promise.all(
            this.keyrings.map((keyring, index) => this.displayForKeyring(keyring, this.addressTypes[index], index))
        );
        return this.memStore.updateState({ keyrings });
    };

    /**
     * Unlock Keyrings
     *
     * Unlocks the keyrings.
     *
     * @emits KeyringController#unlock
     */
    setUnlocked = () => {
        this.memStore.updateState({ isUnlocked: true });
        this.emit('unlock');
    };

    private generateMnemonic = (): string => {
        return bip39.generateMnemonic(128);
    };
}

export default new KeyringService();
