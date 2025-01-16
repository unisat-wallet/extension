import { BroadcastedTransaction } from 'opnet';

import {
    contactBookService,
    keyringService,
    notificationService,
    openapiService,
    permissionService,
    preferenceService,
    sessionService
} from '@/background/service';
import { DisplayedKeyring, Keyring } from '@/background/service/keyring';
import { WalletSaveList } from '@/background/service/preference';
import {
    BroadcastTransactionOptions,
    IDeploymentParametersWithoutSigner,
    InteractionParametersWithoutSigner
} from '@/content-script/pageProvider/Web3Provider.js';
import {
    ADDRESS_TYPES,
    AddressFlagType,
    AUTO_LOCKTIMES,
    BRAND_ALIAN_TYPE_TEXT,
    CHAINS_ENUM,
    CHAINS_MAP,
    ChainType,
    COIN_NAME,
    COIN_SYMBOL,
    DEFAULT_LOCKTIME_ID,
    EVENTS,
    KEYRING_TYPE,
    KEYRING_TYPES,
    NETWORK_TYPES
} from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { SessionEvent } from '@/shared/interfaces/SessionEvent';
import {
    Account,
    AddressSummary,
    AddressType,
    AddressUserToSignInput,
    BitcoinBalance,
    DecodedPsbt,
    NetworkType,
    PublicKeyUserToSignInput,
    SignPsbtOptions,
    ToSignInput,
    WalletKeyring
} from '@/shared/types';
import { getChainInfo } from '@/shared/utils';
import Web3API, { bigIntToDecimal, getBitcoinLibJSNetwork } from '@/shared/web3/Web3API';
import { IDeploymentParameters, IInteractionParameters, Wallet } from '@btc-vision/transaction';
import { publicKeyToAddress, scriptPkToAddress } from '@btc-vision/wallet-sdk/lib/address';
import { bitcoin, ECPair } from '@btc-vision/wallet-sdk/lib/bitcoin-core';
import { KeystoneKeyring } from '@btc-vision/wallet-sdk/lib/keyring';
import {
    genPsbtOfBIP322Simple,
    getSignatureFromPsbtOfBIP322Simple,
    signMessageOfBIP322Simple
} from '@btc-vision/wallet-sdk/lib/message';
import { toPsbtNetwork } from '@btc-vision/wallet-sdk/lib/network';
import { toXOnly } from '@btc-vision/wallet-sdk/lib/utils';
import { AbstractWallet } from '@btc-vision/wallet-sdk/lib/wallet';

import { address as bitcoinAddress, Psbt } from '@btc-vision/bitcoin';
import { ContactBookItem } from '../service/contactBook';
import { OpenApiService } from '../service/openapi';
import { ConnectedSite } from '../service/permission';
import BaseController from './base';
import { InteractionResponse } from '@btc-vision/transaction/src/transaction/TransactionFactory';

// Example: a custom error class with optional data
class WalletControllerError extends Error {
    data?: unknown;

    constructor(message: string, data?: unknown) {
        super(message);
        this.name = 'WalletControllerError';
        this.data = data;
    }
}

const stashKeyrings: Record<string, Keyring> = {};

export interface AccountAsset {
    name: string;
    symbol: string;
    amount: string;
    value: string;
}

export class WalletController extends BaseController {
    openapi: OpenApiService = openapiService;

    timer: string | number | null = null;
    getApproval = notificationService.getApproval;
    resolveApproval = notificationService.resolveApproval;
    rejectApproval = notificationService.rejectApproval;
    getConnectedSite = permissionService.getConnectedSite;
    getSite = permissionService.getSite;
    getConnectedSites = permissionService.getConnectedSites;

    /* wallet */
    boot = async (password: string) => {
        try {
            return await keyringService.boot(password);
        } catch (err) {
            throw new WalletControllerError(`Failed to boot keyringService: ${String(err)}`, {
                passwordProvided: !!password
            });
        }
    };

    isBooted = () => keyringService.isBooted();

    hasVault = () => keyringService.hasVault();

    verifyPassword = (password: string) => keyringService.verifyPassword(password);

    changePassword = (password: string, newPassword: string) => keyringService.changePassword(password, newPassword);

    initAlianNames = async () => {
        try {
            preferenceService.changeInitAlianNameStatus();
            const contacts = this.listContact();
            const keyrings = await keyringService.getAllDisplayedKeyrings();

            keyrings.forEach((v) => {
                v.accounts.forEach((w, index) => {
                    this.updateAlianName(w.pubkey, `${BRAND_ALIAN_TYPE_TEXT[v.type]} ${index + 1}`);
                });
            });

            if (contacts.length !== 0 && keyrings.length !== 0) {
                const allAccounts = keyrings.map((item) => item.accounts).flat();
                const sameAddressList = contacts.filter((item) =>
                    allAccounts.find((contact) => contact.pubkey == item.address)
                );
                if (sameAddressList.length > 0) {
                    sameAddressList.forEach((item) => this.updateAlianName(item.address, item.name));
                }
            }
        } catch (err) {
            throw new WalletControllerError(`Failed to initialize alias names: ${String(err)}`);
        }
    };

    isReady = () => {
        return !!contactBookService.store;
    };

    unlock = async (password: string) => {
        try {
            const alianNameInited = preferenceService.getInitAlianNameStatus();
            const alianNames = contactBookService.listAlias();
            await keyringService.submitPassword(password);
            sessionService.broadcastEvent(SessionEvent.unlock);

            if (!alianNameInited && alianNames.length === 0) {
                await this.initAlianNames();
            }
            this._resetTimeout();
        } catch (err) {
            throw new WalletControllerError(`Unlock failed: ${String(err)}`, { passwordProvided: !!password });
        }
    };

    isUnlocked = () => {
        return keyringService.memStore.getState().isUnlocked;
    };

    lockWallet = async () => {
        try {
            await keyringService.setLocked();
            sessionService.broadcastEvent(SessionEvent.accountsChanged, []);
            sessionService.broadcastEvent(SessionEvent.lock);
            eventBus.emit(EVENTS.broadcastToUI, {
                method: 'lock',
                params: {}
            });
        } catch (err) {
            throw new WalletControllerError(`Lock wallet failed: ${String(err)}`);
        }
    };

    setPopupOpen = (isOpen: boolean) => {
        preferenceService.setPopupOpen(isOpen);
    };

    getAddressBalance = async (address: string) => {
        try {
            const data: BitcoinBalance = await this.getOpNetBalance(address);
            preferenceService.updateAddressBalance(address, data);
            return data;
        } catch (err) {
            throw new WalletControllerError(`Failed to get address balance: ${String(err)}`, { address });
        }
    };

    getMultiAddressAssets = async (addresses: string): Promise<AddressSummary[]> => {
        try {
            const network = this.getChainType();
            Web3API.setNetwork(network);

            const addressList = addresses.split(',');
            const summaries: AddressSummary[] = [];
            for (const address of addressList) {
                const balance = await Web3API.getBalance(address, true);
                const summary: AddressSummary = {
                    address: address,
                    totalSatoshis: Number(balance),
                    loading: false
                };
                summaries.push(summary);
            }
            return summaries;
        } catch (err) {
            throw new WalletControllerError(`Failed to get multi-address assets: ${String(err)}`, { addresses });
        }
    };

    findGroupAssets = (groups: { type: number; address_arr: string[]; pubkey_arr: string[] }[]) => {
        // Potentially wrap this in try/catch if there's network logic.
        return openapiService.findGroupAssets(groups);
    };

    getAddressCacheBalance = (address: string | undefined): BitcoinBalance => {
        const defaultBalance: BitcoinBalance = {
            confirm_amount: '0',
            pending_amount: '0',
            amount: '0',
            usd_value: '0',
            confirm_btc_amount: '0',
            pending_btc_amount: '0',
            btc_amount: '0',
            confirm_inscription_amount: '0',
            pending_inscription_amount: '0',
            inscription_amount: '0'
        };
        if (!address) return defaultBalance;
        return preferenceService.getAddressBalance(address) ?? defaultBalance;
    };

    getAddressHistory = async (params: { address: string; start: number; limit: number }) => {
        try {
            // Just fetch from openapiService for now
            return await openapiService.getAddressRecentHistory(params);
        } catch (err) {
            throw new WalletControllerError(`Failed to get address history: ${String(err)}`, params);
        }
    };

    getAddressCacheHistory = (address: string | undefined) => {
        if (!address) return [];
        return preferenceService.getAddressHistory(address);
    };

    /* keyrings */

    getExternalLinkAck = () => {
        return preferenceService.getExternalLinkAck();
    };

    setExternalLinkAck = (ack: boolean) => {
        preferenceService.setExternalLinkAck(ack);
    };

    getLocale = () => {
        return preferenceService.getLocale();
    };

    setLocale = async (locale: string) => {
        await preferenceService.setLocale(locale);
    };

    getCurrency = () => {
        return preferenceService.getCurrency();
    };

    setCurrency = (currency: string) => {
        preferenceService.setCurrency(currency);
    };

    clearKeyrings = () => keyringService.clearKeyrings();

    getPrivateKey = async (password: string, { pubkey, type }: { pubkey: string; type: string }) => {
        await this.verifyPassword(password);
        const keyring = keyringService.getKeyringForAccount(pubkey, type);
        if (!keyring) return null;

        const privateKey = keyring.exportAccount(pubkey);
        const networkType = this.getNetworkType();
        const network = toPsbtNetwork(networkType);

        const wif = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network }).toWIF();
        return {
            hex: privateKey,
            wif
        };
    };

    getInternalPrivateKey = ({ pubkey, type }: { pubkey: string; type: string }) => {
        if (!pubkey) {
            throw new WalletControllerError('No pubkey found in parameters');
        }
        const keyring = keyringService.getKeyringForAccount(pubkey, type);
        if (!keyring) return null;

        const privateKey = keyring.exportAccount(pubkey);
        const networkType = this.getNetworkType();
        const network = toPsbtNetwork(networkType);
        const hex = privateKey;
        const wif = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network }).toWIF();

        return {
            hex,
            wif
        };
    };

    getMnemonics = async (password: string, keyring: WalletKeyring) => {
        await this.verifyPassword(password);
        const originKeyring = keyringService.keyrings[keyring.index];
        const serialized = originKeyring.serialize();

        if (!('mnemonic' in serialized)) {
            throw new WalletControllerError('No mnemonic found in keyring');
        }

        return {
            mnemonic: serialized.mnemonic,
            hdPath: serialized.hdPath,
            passphrase: serialized.passphrase
        };
    };

    createKeyringWithPrivateKey = async (data: string, addressType: AddressType, alianName?: string) => {
        let originKeyring: Keyring;
        try {
            originKeyring = await keyringService.importPrivateKey(data, addressType);
        } catch (e) {
            console.warn('Something went wrong while attempting to load keyring', e);
            throw new WalletControllerError(`Could not import private key: ${String(e)}`, {
                data,
                addressType
            });
        }

        const pubkeys = originKeyring.getAccounts();
        if (alianName) this.updateAlianName(pubkeys[0], alianName);

        const displayedKeyring = keyringService.displayForKeyring(
            originKeyring,
            addressType,
            keyringService.keyrings.length - 1
        );
        const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, keyringService.keyrings.length - 1);
        this.changeKeyring(keyring);
    };

    getPreMnemonics = () => keyringService.getPreMnemonics();

    generatePreMnemonic = () => keyringService.generatePreMnemonic();

    removePreMnemonics = () => keyringService.removePreMnemonics();

    createKeyringWithMnemonics = async (
        mnemonic: string,
        hdPath: string,
        passphrase: string,
        addressType: AddressType,
        accountCount: number
    ) => {
        try {
            const originKeyring = await keyringService.createKeyringWithMnemonics(
                mnemonic,
                hdPath,
                passphrase,
                addressType,
                accountCount
            );
            keyringService.removePreMnemonics();

            const displayedKeyring = keyringService.displayForKeyring(
                originKeyring,
                addressType,
                keyringService.keyrings.length - 1
            );

            const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, keyringService.keyrings.length - 1);
            this.changeKeyring(keyring);
            preferenceService.setShowSafeNotice(true);
        } catch (err) {
            throw new WalletControllerError(`Could not create keyring from mnemonics: ${String(err)}`);
        }
    };

    createTmpKeyringWithMnemonics = (
        mnemonic: string,
        hdPath: string,
        passphrase: string,
        addressType: AddressType,
        accountCount = 1
    ) => {
        const activeIndexes: number[] = [];
        for (let i = 0; i < accountCount; i++) {
            activeIndexes.push(i);
        }

        const network = this.getNetworkType();
        const originKeyring = keyringService.createTmpKeyring('HD Key Tree', {
            mnemonic,
            activeIndexes,
            hdPath,
            passphrase,
            network: getBitcoinLibJSNetwork(network)
        });

        const displayedKeyring = keyringService.displayForKeyring(originKeyring, addressType, -1);
        return this.displayedKeyringToWalletKeyring(displayedKeyring, -1, false);
    };

    createTmpKeyringWithPrivateKey = (privateKey: string, addressType: AddressType) => {
        const network = this.getNetworkType();
        const originKeyring = keyringService.createTmpKeyring(KEYRING_TYPE.SimpleKeyring, {
            privateKeys: [privateKey],
            network: getBitcoinLibJSNetwork(network)
        });
        const displayedKeyring = keyringService.displayForKeyring(originKeyring, addressType, -1);

        preferenceService.setShowSafeNotice(true);
        return this.displayedKeyringToWalletKeyring(displayedKeyring, -1, false);
    };

    createTmpKeyringWithKeystone = async (
        urType: string,
        urCbor: string,
        addressType: AddressType,
        hdPath: string,
        accountCount: number
    ) => {
        const tmpKeyring = new KeystoneKeyring();
        await tmpKeyring.initFromUR(urType, urCbor);
        if (hdPath.length >= 13) {
            tmpKeyring.changeChangeAddressHdPath(hdPath);
            tmpKeyring.addAccounts(accountCount);
        } else {
            tmpKeyring.changeHdPath(ADDRESS_TYPES[addressType].hdPath);
            if (accountCount) {
                tmpKeyring.addAccounts(accountCount);
            }
        }

        const opts = tmpKeyring.serialize();
        const originKeyring = keyringService.createTmpKeyring(KEYRING_TYPE.KeystoneKeyring, opts);
        const displayedKeyring = keyringService.displayForKeyring(originKeyring, addressType, -1);
        preferenceService.setShowSafeNotice(false);
        return this.displayedKeyringToWalletKeyring(displayedKeyring, -1, false);
    };

    createKeyringWithKeystone = async (
        urType: string,
        urCbor: string,
        addressType: AddressType,
        hdPath: string,
        accountCount = 1,
        filterPubkey: string[] = []
    ) => {
        try {
            const originKeyring = await keyringService.createKeyringWithKeystone(
                urType,
                urCbor,
                addressType,
                hdPath,
                accountCount
            );

            if (filterPubkey?.length > 0) {
                const accounts = originKeyring.getAccounts();
                accounts.forEach((account) => {
                    if (!filterPubkey.includes(account)) {
                        originKeyring.removeAccount(account);
                    }
                });
            }
            const displayedKeyring = keyringService.displayForKeyring(
                originKeyring,
                addressType,
                keyringService.keyrings.length - 1
            );
            const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, keyringService.keyrings.length - 1);
            this.changeKeyring(keyring);
            preferenceService.setShowSafeNotice(false);
        } catch (err) {
            throw new WalletControllerError(`Could not create keyring with Keystone data: ${String(err)}`, {
                urType,
                urCbor,
                addressType,
                hdPath,
                accountCount
            });
        }
    };

    removeKeyring = async (keyring: WalletKeyring) => {
        try {
            await keyringService.removeKeyring(keyring.index);
            const keyrings = await this.getKeyrings();
            const nextKeyring = keyrings[keyrings.length - 1];
            if (nextKeyring?.accounts[0]) {
                this.changeKeyring(nextKeyring);
                return nextKeyring;
            }
        } catch (err) {
            throw new WalletControllerError(`Could not remove keyring: ${String(err)}`, { keyring });
        }
    };

    getKeyringByType = (type: string) => {
        return keyringService.getKeyringByType(type);
    };

    deriveNewAccountFromMnemonic = async (keyring: WalletKeyring, alianName?: string) => {
        try {
            const _keyring = keyringService.keyrings[keyring.index];
            const result = await keyringService.addNewAccount(_keyring);
            if (alianName) this.updateAlianName(result[0], alianName);

            const currentKeyring = await this.getCurrentKeyring();
            if (!currentKeyring) {
                throw new WalletControllerError('No current keyring after deriving new account');
            }
            this.changeKeyring(currentKeyring, currentKeyring.accounts.length - 1);
        } catch (err) {
            throw new WalletControllerError(`Could not derive new account from mnemonic: ${String(err)}`, {
                keyring,
                alianName
            });
        }
    };

    getAccountsCount = () => {
        const accounts = keyringService.getAccounts();
        return accounts.filter((x) => x).length;
    };

    changeKeyring = (keyring: WalletKeyring, accountIndex = 0) => {
        preferenceService.setCurrentKeyringIndex(keyring.index);
        preferenceService.setCurrentAccount(keyring.accounts[accountIndex]);
        const flag = preferenceService.getAddressFlag(keyring.accounts[accountIndex].address);
        openapiService.setClientAddress(keyring.accounts[accountIndex].address, flag);
    };

    getAllAddresses = (keyring: WalletKeyring, index: number) => {
        const networkType = this.getNetworkType();
        const addresses: string[] = [];
        const _keyring = keyringService.keyrings[keyring.index] as KeystoneKeyring;
        if (keyring.type === KEYRING_TYPE.HdKeyring || keyring.type === KEYRING_TYPE.KeystoneKeyring) {
            const pathPubkey: Record<string, string> = {};
            ADDRESS_TYPES.filter((v) => v.displayIndex >= 0).forEach((v) => {
                let pubkey = pathPubkey[v.hdPath];
                if (!pubkey && _keyring.getAccountByHdPath) {
                    pubkey = _keyring.getAccountByHdPath(v.hdPath, index);
                }
                const address = publicKeyToAddress(pubkey, v.value, networkType);
                addresses.push(address);
            });
        } else {
            ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && v.isUnisatLegacy === false).forEach((v) => {
                const pubkey = keyring.accounts[index].pubkey;
                const address = publicKeyToAddress(pubkey, v.value, networkType);
                addresses.push(address);
            });
        }
        return addresses;
    };

    changeAddressType = async (addressType: AddressType) => {
        try {
            const currentAccount = await this.getCurrentAccount();
            const currentKeyringIndex = preferenceService.getCurrentKeyringIndex();
            await keyringService.changeAddressType(currentKeyringIndex, addressType);

            const keyring = await this.getCurrentKeyring();
            if (!keyring) throw new WalletControllerError('No current keyring');
            this.changeKeyring(keyring, currentAccount?.index);
        } catch (err) {
            throw new WalletControllerError(`Failed to change address type: ${String(err)}`, { addressType });
        }
    };

    signTransaction = (type: string, from: string, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
        const keyring = keyringService.getKeyringForAccount(from, type);
        return keyringService.signTransaction(keyring, psbt, inputs);
    };

    formatOptionsToSignInputs = async (_psbt: string | bitcoin.Psbt, options?: SignPsbtOptions) => {
        const account = await this.getCurrentAccount();
        if (!account) {
            throw new WalletControllerError('No current account: formatOptionsToSignInputs');
        }

        let toSignInputs: ToSignInput[] = [];
        if (options?.toSignInputs) {
            // Validate user-provided inputs
            toSignInputs = options.toSignInputs.map((input) => {
                const index = Number(input.index);
                if (isNaN(index)) throw new Error('invalid index in toSignInput');

                if (!(input as AddressUserToSignInput).address && !(input as PublicKeyUserToSignInput).publicKey) {
                    throw new WalletControllerError('No address or public key in toSignInput');
                }

                if (
                    (input as AddressUserToSignInput).address &&
                    (input as AddressUserToSignInput).address != account.address
                ) {
                    throw new WalletControllerError('Invalid address in toSignInput');
                }

                if (
                    (input as PublicKeyUserToSignInput).publicKey &&
                    (input as PublicKeyUserToSignInput).publicKey != account.pubkey
                ) {
                    throw new WalletControllerError('Invalid public key in toSignInput');
                }

                const sighashTypes = input.sighashTypes?.map(Number);
                if (sighashTypes?.some(isNaN)) {
                    throw new WalletControllerError('Invalid sighash type in toSignInput');
                }

                return {
                    index,
                    publicKey: account.pubkey,
                    sighashTypes,
                    disableTweakSigner: input.disableTweakSigner
                };
            });
        } else {
            // No custom toSignInputs => auto-detect
            const networkType = this.getNetworkType();
            const psbtNetwork = toPsbtNetwork(networkType);

            const psbt = typeof _psbt === 'string' ? bitcoin.Psbt.fromHex(_psbt, { network: psbtNetwork }) : _psbt;
            psbt.data.inputs.forEach((v, index) => {
                let script: Buffer | null = null;
                if (v.witnessUtxo) {
                    script = v.witnessUtxo.script;
                } else if (v.nonWitnessUtxo) {
                    const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
                    const output = tx.outs[psbt.txInputs[index].index];
                    script = output.script;
                }
                const isSigned = v.finalScriptSig ?? v.finalScriptWitness;
                if (script && !isSigned) {
                    const address = scriptPkToAddress(script, networkType);
                    if (account.address === address) {
                        toSignInputs.push({
                            index,
                            publicKey: account.pubkey,
                            sighashTypes: v.sighashType ? [v.sighashType] : undefined
                        });
                    }
                }
            });
        }
        return toSignInputs;
    };

    signPsbt = async (psbt: bitcoin.Psbt, toSignInputs: ToSignInput[], autoFinalized: boolean) => {
        const account = await this.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account: signPsbt');

        const keyring = await this.getCurrentKeyring();
        if (!keyring) throw new WalletControllerError('No current keyring');
        const __keyring = keyringService.keyrings[keyring.index];

        const networkType = this.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);

        if (!toSignInputs) {
            toSignInputs = await this.formatOptionsToSignInputs(psbt);
        }

        // Attempt to fix missing tapInternalKey for P2TR inputs
        psbt.data.inputs.forEach((v) => {
            const isNotSigned = !(v.finalScriptSig ?? v.finalScriptWitness);
            const isP2TR = keyring.addressType === AddressType.P2TR || keyring.addressType === AddressType.M44_P2TR;
            const lostInternalPubkey = !v.tapInternalKey;

            if (isNotSigned && isP2TR && lostInternalPubkey) {
                const tapInternalKey = toXOnly(Buffer.from(account.pubkey, 'hex'));
                const { output } = bitcoin.payments.p2tr({
                    internalPubkey: tapInternalKey,
                    network: psbtNetwork
                });

                if (v.witnessUtxo?.script.toString('hex') == output?.toString('hex')) {
                    v.tapInternalKey = tapInternalKey;
                }
            }
        });

        // Keystone special handling
        if (keyring.type === KEYRING_TYPE.KeystoneKeyring) {
            const _keyring = __keyring as KeystoneKeyring;
            if (!_keyring.mfp) {
                throw new WalletControllerError('No master fingerprint found in Keystone keyring');
            }

            toSignInputs.forEach((input) => {
                const isP2TR = keyring.addressType === AddressType.P2TR || keyring.addressType === AddressType.M44_P2TR;
                const bip32Derivation = {
                    masterFingerprint: Buffer.from(_keyring.mfp, 'hex'),
                    path: `${keyring.hdPath}/${account.index}`,
                    pubkey: Buffer.from(account.pubkey, 'hex')
                };

                if (isP2TR) {
                    psbt.data.inputs[input.index].tapBip32Derivation = [
                        {
                            ...bip32Derivation,
                            pubkey: bip32Derivation.pubkey.subarray(1),
                            leafHashes: []
                        }
                    ];
                } else {
                    psbt.data.inputs[input.index].bip32Derivation = [bip32Derivation];
                }
            });
            return psbt;
        }

        // Normal keyring
        psbt = keyringService.signTransaction(__keyring, psbt, toSignInputs);
        if (autoFinalized) {
            toSignInputs.forEach((v) => {
                psbt.finalizeInput(v.index);
            });
        }
        return psbt;
    };

    signPsbtWithHex = async (psbtHex: string, toSignInputs: ToSignInput[], autoFinalized: boolean) => {
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        await this.signPsbt(psbt, toSignInputs, autoFinalized);
        return psbt.toHex();
    };

    signMessage = (text: string) => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');
        return keyringService.signMessage(account.pubkey, account.type, text);
    };

    signAndBroadcastInteraction = async (
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<[BroadcastedTransaction, BroadcastedTransaction, import('@btc-vision/transaction').UTXO[], string]> => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new WalletControllerError('Could not retrieve internal private key');

        try {
            const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
            const utxos = interactionParameters.utxos.map((utxo) => ({
                ...utxo,
                value: typeof utxo.value === 'bigint' ? utxo.value : BigInt(utxo.value as unknown as string)
            }));

            const interactionParametersSubmit: IInteractionParameters = {
                from: interactionParameters.from,
                to: interactionParameters.to,
                utxos,
                signer: walletGet.keypair,
                network: Web3API.network,
                feeRate: interactionParameters.feeRate,
                priorityFee: BigInt(interactionParameters.priorityFee || 0n),
                gasSatFee: BigInt(interactionParameters.gasSatFee || 330n),
                calldata: Buffer.from(interactionParameters.calldata as unknown as string, 'hex')
            };

            const sendTransaction = await Web3API.transactionFactory.signInteraction(interactionParametersSubmit);
            const firstTransaction = await Web3API.provider.sendRawTransaction(
                sendTransaction.fundingTransaction,
                false
            );

            if (!firstTransaction) {
                throw new WalletControllerError('No result from funding transaction broadcast');
            }
            if (firstTransaction.error) {
                throw new WalletControllerError(firstTransaction.error);
            }

            // This transaction is partially signed. Submitting it to OpNet
            const secondTransaction = await Web3API.provider.sendRawTransaction(
                sendTransaction.interactionTransaction,
                false
            );
            if (!secondTransaction) {
                throw new WalletControllerError('No result from interaction transaction broadcast');
            }
            if (secondTransaction.error) {
                throw new WalletControllerError(secondTransaction.error);
            }

            return [firstTransaction, secondTransaction, sendTransaction.nextUTXOs, sendTransaction.preimage];
        } catch (err) {
            throw new WalletControllerError(`signAndBroadcastInteraction failed: ${String(err)}`, {
                interactionParameters
            });
        }
    };

    deployContract = async (params: IDeploymentParametersWithoutSigner) => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new WalletControllerError('Could not retrieve internal private key');

        try {
            const utxos = params.utxos.map((utxo) => ({
                ...utxo,
                value: typeof utxo.value === 'bigint' ? utxo.value : BigInt(utxo.value as unknown as string)
            }));

            const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
            const deployContractParameters: IDeploymentParameters = {
                ...params,
                utxos,
                signer: walletGet.keypair,
                network: Web3API.network,
                feeRate: Number(params.feeRate.toString()),
                gasSatFee: BigInt(params.gasSatFee || 0n) < 330n ? 330n : BigInt(params.gasSatFee || 0n),
                priorityFee: BigInt(params.priorityFee || 0n),
                bytecode:
                    typeof params.bytecode === 'string'
                        ? Buffer.from(params.bytecode, 'hex')
                        : Buffer.from(params.bytecode),
                calldata: params.calldata
                    ? typeof params.calldata === 'string'
                        ? Buffer.from(params.calldata, 'hex')
                        : Buffer.from(params.calldata)
                    : undefined,
                optionalOutputs: params.optionalOutputs || []
            };

            return await Web3API.transactionFactory.signDeployment(deployContractParameters);
        } catch (err) {
            throw new WalletControllerError(`Failed to deploy contract: ${String(err)}`, { params });
        }
    };

    signInteraction = async (
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<InteractionResponse> => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new WalletControllerError('Could not retrieve internal private key');

        try {
            const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
            const utxos = interactionParameters.utxos.map((utxo) => ({
                ...utxo,
                value: typeof utxo.value === 'bigint' ? utxo.value : BigInt(utxo.value as unknown as string)
            }));

            const interactionParametersSubmit: IInteractionParameters = {
                from: interactionParameters.from,
                to: interactionParameters.to,
                utxos,
                signer: walletGet.keypair,
                network: Web3API.network,
                feeRate: interactionParameters.feeRate,
                priorityFee: BigInt(interactionParameters.priorityFee || 0n),
                gasSatFee: BigInt(interactionParameters.gasSatFee || 330n),
                calldata: Buffer.from(interactionParameters.calldata as unknown as string, 'hex'),
                optionalOutputs: interactionParameters.optionalOutputs || []
            };

            return await Web3API.transactionFactory.signInteraction(interactionParametersSubmit);
        } catch (err) {
            throw new WalletControllerError(`Failed to sign interaction: ${String(err)}`, {
                interactionParameters
            });
        }
    };

    broadcast = async (transactions: BroadcastTransactionOptions[]): Promise<BroadcastedTransaction[]> => {
        const broadcastedTransactions: BroadcastedTransaction[] = [];

        for (const transaction of transactions) {
            try {
                const broadcastedTransaction = await Web3API.provider.sendRawTransaction(
                    transaction.raw,
                    transaction.psbt
                );
                if (!broadcastedTransaction) {
                    throw new WalletControllerError('Error in broadcast: no response');
                }
                if (broadcastedTransaction.error) {
                    throw new WalletControllerError(broadcastedTransaction.error);
                }
                broadcastedTransactions.push(broadcastedTransaction);
            } catch (err) {
                throw new WalletControllerError(`Broadcast failed: ${String(err)}`, transaction);
            }
        }

        return broadcastedTransactions;
    };

    signBIP322Simple = async (text: string) => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');
        const networkType = this.getNetworkType();
        try {
            return await signMessageOfBIP322Simple({
                message: text,
                address: account.address,
                networkType,
                wallet: this as unknown as AbstractWallet
            });
        } catch (err) {
            throw new WalletControllerError(`Failed to sign BIP322 message: ${String(err)}`, {
                text,
                networkType
            });
        }
    };

    signData = (data: string, type: 'ecdsa' | 'schnorr' = 'ecdsa') => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');
        return keyringService.signData(account.pubkey, data, type);
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

    getNextAlianName = (keyring: WalletKeyring) => {
        return this._generateAlianName(keyring.type, keyring.accounts.length + 1);
    };

    getHighlightWalletList = () => {
        return preferenceService.getWalletSavedList();
    };

    updateHighlightWalletList = (list: WalletSaveList) => {
        return preferenceService.updateWalletSavedList(list);
    };

    getAlianName = (pubkey: string) => {
        return contactBookService.getContactByAddress(pubkey)?.name;
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
        try {
            const balance = await openapiService.getAddressBalance(pubkeyAddress);
            const assets: AccountAsset[] = [
                { name: COIN_NAME, symbol: COIN_SYMBOL, amount: balance.amount, value: balance.usd_value }
            ];
            return assets;
        } catch (err) {
            throw new WalletControllerError(`Failed to list chain assets: ${String(err)}`, {
                pubkeyAddress
            });
        }
    };

    reportErrors = (error: string) => {
        console.error('report not implemented:', error);
        // Potentially forward to logging service
    };

    getNetworkType = (): NetworkType => {
        const chainType = this.getChainType();
        return CHAINS_MAP[chainType].networkType;
    };

    setNetworkType = async (networkType: NetworkType) => {
        if (networkType === NetworkType.MAINNET) {
            await this.setChainType(ChainType.BITCOIN_MAINNET);
        } else if (networkType === NetworkType.REGTEST) {
            await this.setChainType(ChainType.BITCOIN_REGTEST);
        } else {
            await this.setChainType(ChainType.BITCOIN_TESTNET);
        }
    };

    getNetworkName = () => {
        const networkType = this.getNetworkType();
        return NETWORK_TYPES[networkType].name;
    };

    getLegacyNetworkName = () => {
        const chainType = this.getChainType();
        return NETWORK_TYPES[CHAINS_MAP[chainType].networkType].name;
    };

    setChainType = async (chainType: ChainType) => {
        try {
            Web3API.setNetwork(chainType);
            preferenceService.setChainType(chainType);
            await this.openapi.setEndpoints(CHAINS_MAP[chainType].endpoints);

            const currentAccount = await this.getCurrentAccount();
            const keyring = await this.getCurrentKeyring();
            if (!keyring) {
                throw new WalletControllerError('No current keyring in setChainType');
            }
            this.changeKeyring(keyring, currentAccount?.index);

            const chainInfo = getChainInfo(chainType);
            sessionService.broadcastEvent<SessionEvent.chainChanged>(SessionEvent.chainChanged, chainInfo);
            eventBus.emit(EVENTS.broadcastToUI, {
                method: 'chainChanged',
                params: chainInfo
            });

            const network = this.getLegacyNetworkName();
            sessionService.broadcastEvent<SessionEvent.networkChanged>(SessionEvent.networkChanged, {
                network,
                chainType
            });
        } catch (err) {
            throw new WalletControllerError(`Failed to set chain type: ${String(err)}`, { chainType });
        }
    };

    getChainType = (): ChainType => {
        return preferenceService.getChainType();
    };

    pushTx = async (rawtx: string) => {
        try {
            return await this.openapi.pushTx(rawtx);
        } catch (err) {
            throw new WalletControllerError(`Failed to push transaction: ${String(err)}`, { rawtx });
        }
    };

    getAccounts = async () => {
        const keyrings = await this.getKeyrings();
        return keyrings.reduce<Account[]>((pre, cur) => pre.concat(cur.accounts), []);
    };

    displayedKeyringToWalletKeyring = (displayedKeyring: DisplayedKeyring, index: number, initName = true) => {
        const networkType = this.getNetworkType();
        const addressType = displayedKeyring.addressType;
        const key = `keyring_${index}`;
        const type = displayedKeyring.type;
        const accounts: Account[] = [];

        for (let j = 0; j < displayedKeyring.accounts.length; j++) {
            const { pubkey } = displayedKeyring.accounts[j];
            const address = publicKeyToAddress(pubkey, addressType, networkType);
            const accountKey = `${key}#${j}`;
            const defaultName = this.getAlianName(pubkey) ?? this._generateAlianName(type, j + 1);
            const alianName = preferenceService.getAccountAlianName(accountKey, defaultName);
            const flag = preferenceService.getAddressFlag(address);
            accounts.push({
                type,
                pubkey,
                address,
                alianName,
                index: j,
                key: accountKey,
                flag
            });
        }
        const hdPath =
            type === KEYRING_TYPE.HdKeyring || type === KEYRING_TYPE.KeystoneKeyring
                ? displayedKeyring.keyring.hdPath
                : '';
        const alianName = preferenceService.getKeyringAlianName(
            key,
            initName ? `${KEYRING_TYPES[type].alianName} #${index + 1}` : ''
        );
        const walletKeyring: WalletKeyring = {
            index,
            key,
            type,
            addressType,
            accounts,
            alianName,
            hdPath
        };
        return walletKeyring;
    };

    getKeyrings = async (): Promise<WalletKeyring[]> => {
        const displayedKeyrings = await keyringService.getAllDisplayedKeyrings();
        const keyrings: WalletKeyring[] = [];

        for (const displayedKeyring of displayedKeyrings) {
            if (displayedKeyring.type === KEYRING_TYPE.Empty) {
                continue;
            }
            const walletKeyring = this.displayedKeyringToWalletKeyring(displayedKeyring, displayedKeyring.index);
            keyrings.push(walletKeyring);
        }
        return keyrings;
    };

    getCurrentKeyring = async () => {
        let currentKeyringIndex = preferenceService.getCurrentKeyringIndex();
        const displayedKeyrings = await keyringService.getAllDisplayedKeyrings();
        if (currentKeyringIndex === undefined) {
            const currentAccount = preferenceService.getCurrentAccount();
            for (let i = 0; i < displayedKeyrings.length; i++) {
                if (displayedKeyrings[i].type !== currentAccount?.type) continue;
                const found = displayedKeyrings[i].accounts.find((v) => v.pubkey === currentAccount?.pubkey);
                if (found) {
                    currentKeyringIndex = i;
                    break;
                }
            }
            if (currentKeyringIndex === undefined) {
                currentKeyringIndex = 0;
            }
        }

        if (
            !displayedKeyrings[currentKeyringIndex] ||
            displayedKeyrings[currentKeyringIndex].type === KEYRING_TYPE.Empty ||
            !displayedKeyrings[currentKeyringIndex].accounts[0]
        ) {
            for (let i = 0; i < displayedKeyrings.length; i++) {
                if (displayedKeyrings[i].type !== KEYRING_TYPE.Empty) {
                    currentKeyringIndex = i;
                    preferenceService.setCurrentKeyringIndex(currentKeyringIndex);
                    break;
                }
            }
        }

        const displayedKeyring = displayedKeyrings[currentKeyringIndex];
        if (!displayedKeyring) return null;
        return this.displayedKeyringToWalletKeyring(displayedKeyring, currentKeyringIndex);
    };

    getCurrentAccount = async () => {
        const currentKeyring = await this.getCurrentKeyring();
        if (!currentKeyring) return null;
        const account = preferenceService.getCurrentAccount();
        let currentAccount: Account | undefined;

        currentKeyring.accounts.forEach((v) => {
            if (v.pubkey === account?.pubkey) {
                currentAccount = v;
            }
        });
        if (!currentAccount) {
            currentAccount = currentKeyring.accounts[0];
        }

        if (currentAccount) {
            currentAccount.flag = preferenceService.getAddressFlag(currentAccount.address);
            openapiService.setClientAddress(currentAccount.address, currentAccount.flag);
        }
        return currentAccount;
    };

    getEditingKeyring = async () => {
        const editingKeyringIndex = preferenceService.getEditingKeyringIndex();
        const displayedKeyrings = await keyringService.getAllDisplayedKeyrings();
        const displayedKeyring = displayedKeyrings[editingKeyringIndex];
        return this.displayedKeyringToWalletKeyring(displayedKeyring, editingKeyringIndex);
    };

    setEditingKeyring = (index: number) => {
        preferenceService.setEditingKeyringIndex(index);
    };

    getEditingAccount = () => {
        return preferenceService.getEditingAccount();
    };

    setEditingAccount = (account: Account) => {
        preferenceService.setEditingAccount(account);
    };

    getAppSummary = async () => {
        const appTab = preferenceService.getAppTab();
        try {
            const data = await openapiService.getAppSummary();
            const readTabTime = appTab.readTabTime;
            data.apps.forEach((w) => {
                const readAppTime = appTab.readAppTime[w.id];
                if (w.time) {
                    if (Date.now() > w.time + 1000 * 60 * 60 * 24 * 7) {
                        w.new = false;
                    } else {
                        w.new = !(readAppTime && readAppTime > w.time);
                    }
                } else {
                    w.new = false;
                }
            });
            data.readTabTime = readTabTime;
            preferenceService.setAppSummary(data);
            return data;
        } catch (e) {
            console.log('getAppSummary error:', e);
            return appTab.summary;
        }
    };

    readTab = () => {
        return preferenceService.setReadTabTime(Date.now());
    };

    readApp = (appid: number) => {
        return preferenceService.setReadAppTime(appid, Date.now());
    };

    getAddressUtxo = async (address: string) => {
        return await openapiService.getBTCUtxos(address);
    };

    setRecentConnectedSites = (sites: ConnectedSite[]) => {
        permissionService.setRecentConnectedSites(sites);
    };

    getRecentConnectedSites = () => {
        return permissionService.getRecentConnectedSites();
    };

    getCurrentSite = (tabId: number): ConnectedSite | null => {
        const { origin = '', name = '', icon = '' } = sessionService.getSession(tabId) || {};
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
        if (!origin) {
            return undefined;
        }
        return permissionService.getWithoutUpdate(origin);
    };

    setSite = (data: ConnectedSite) => {
        permissionService.setSite(data);
        if (data.isConnected) {
            const network = this.getLegacyNetworkName();
            const chainType = this.getChainType();
            sessionService.broadcastEvent(SessionEvent.networkChanged, { network, chainType }, data.origin);
        }
    };

    updateConnectSite = (origin: string, data: ConnectedSite) => {
        permissionService.updateConnectSite(origin, data);
        const network = this.getLegacyNetworkName();
        const chainType = this.getChainType();
        sessionService.broadcastEvent(SessionEvent.networkChanged, { network, chainType }, data.origin);
    };

    removeAllRecentConnectedSites = () => {
        const sites = permissionService.getRecentConnectedSites().filter((item) => !item.isTop);
        sites.forEach((item) => {
            this.removeConnectedSite(item.origin);
        });
    };

    removeConnectedSite = (origin: string) => {
        sessionService.broadcastEvent(SessionEvent.accountsChanged, [], origin);
        permissionService.removeConnectedSite(origin);
    };

    setKeyringAlianName = (keyring: WalletKeyring, name: string) => {
        preferenceService.setKeyringAlianName(keyring.key, name);
        keyring.alianName = name;
        return keyring;
    };

    setAccountAlianName = (account: Account, name: string) => {
        preferenceService.setAccountAlianName(account.key, name);
        account.alianName = name;
        return account;
    };

    addAddressFlag = (account: Account, flag: AddressFlagType) => {
        account.flag = preferenceService.addAddressFlag(account.address, flag);
        openapiService.setClientAddress(account.address, account.flag);
        return account;
    };

    removeAddressFlag = (account: Account, flag: AddressFlagType) => {
        account.flag = preferenceService.removeAddressFlag(account.address, flag);
        openapiService.setClientAddress(account.address, account.flag);
        return account;
    };

    getFeeSummary = async () => {
        return openapiService.getFeeSummary();
    };

    getBtcPrice = async () => {
        return openapiService.getBtcPrice();
    };

    decodePsbt(psbtHex: string): DecodedPsbt {
        const networkType = this.getNetworkType();
        const network = getBitcoinLibJSNetwork(networkType);

        const psbt = Psbt.fromHex(psbtHex, { network });

        const inputs = psbt.txInputs.map((input, index) => {
            const inputData = psbt.data.inputs[index];
            let address = 'unknown';

            if (inputData.witnessUtxo?.script) {
                try {
                    address = bitcoinAddress.fromOutputScript(inputData.witnessUtxo.script, network).toString();
                } catch {
                    address = 'unknown';
                }
            }

            return {
                txid: Buffer.from(input.hash).reverse().toString('hex'),
                vout: input.index,
                address,
                value: inputData.witnessUtxo?.value || 0,
                sighashType: inputData.sighashType
            };
        });

        const outputs = psbt.txOutputs.map((output) => ({
            address: output.address || 'unknown',
            value: output.value
        }));

        const totalInputValue = inputs.reduce((sum, input) => sum + input.value, 0);
        const totalOutputValue = outputs.reduce((sum, output) => sum + output.value, 0);

        const fee = totalInputValue - totalOutputValue;

        const transactionSize = psbt.toBuffer().length;
        const feeRate = transactionSize > 0 ? fee / transactionSize : 0;

        const rbfEnabled = psbt.txInputs.some((input) => input.sequence && input.sequence < 0xfffffffe);

        // Arbitrary recommended fee rate example
        const recommendedFeeRate = 1;
        const shouldWarnFeeRate = feeRate < recommendedFeeRate;

        return {
            risks: [],
            inputs,
            outputs,
            fee,
            feeRate,
            transactionSize,
            rbfEnabled,
            recommendedFeeRate,
            shouldWarnFeeRate
        };
    }

    createPaymentUrl = (address: string, channel: string) => {
        return openapiService.createPaymentUrl(address, channel);
    };

    getWalletConfig = () => {
        return openapiService.getWalletConfig();
    };

    getSkippedVersion = () => {
        return preferenceService.getSkippedVersion();
    };

    setSkippedVersion = (version: string) => {
        return preferenceService.setSkippedVersion(version);
    };

    checkWebsite = (website: string) => {
        return openapiService.checkWebsite(website);
    };

    getAddressSummary = async (address: string) => {
        try {
            return await openapiService.getAddressSummary(address);
        } catch (err) {
            throw new WalletControllerError(`Failed to get address summary: ${String(err)}`, { address });
        }
    };

    getShowSafeNotice = () => {
        return preferenceService.getShowSafeNotice();
    };

    setShowSafeNotice = (show: boolean) => {
        return preferenceService.setShowSafeNotice(show);
    };

    getVersionDetail = (version: string) => {
        return openapiService.getVersionDetail(version);
    };

    checkKeyringMethod = async (method: string) => {
        const account = await this.getCurrentAccount();
        if (!account) throw new WalletControllerError('No current account');

        const keyring = keyringService.getKeyringForAccount(account.pubkey);
        if (!keyring) {
            throw new WalletControllerError('Keyring does not exist for current account', { account });
        }

        // @ts-expect-error
        if (!keyring[method]) {
            throw new WalletControllerError(`Keyring does not have "${method}" method`, { method });
        }

        return { account, keyring };
    };

    genSignPsbtUr = async (psbtHex: string) => {
        const { keyring } = await this.checkKeyringMethod('genSignPsbtUr');
        try {
            return await (keyring as KeystoneKeyring).genSignPsbtUr(psbtHex);
        } catch (err) {
            throw new WalletControllerError(`Failed to generate sign PSBT UR: ${String(err)}`, { psbtHex });
        }
    };

    parseSignPsbtUr = async (type: string, cbor: string, isFinalize = true) => {
        const { keyring } = await this.checkKeyringMethod('parseSignPsbtUr');
        try {
            const psbtHex = await (keyring as KeystoneKeyring).parseSignPsbtUr(type, cbor);
            const psbt = bitcoin.Psbt.fromHex(psbtHex);
            if (isFinalize) {
                psbt.finalizeAllInputs();
            }
            return {
                psbtHex: psbt.toHex(),
                rawtx: isFinalize ? psbt.extractTransaction().toHex() : undefined
            };
        } catch (err) {
            throw new WalletControllerError(`Failed to parse sign PSBT UR: ${String(err)}`, {
                type,
                cbor,
                isFinalize
            });
        }
    };

    genSignMsgUr = async (text: string, msgType?: string) => {
        if (msgType === 'bip322-simple') {
            const account = await this.getCurrentAccount();
            if (!account) throw new WalletControllerError('No current account');
            try {
                const psbt = genPsbtOfBIP322Simple({
                    message: text,
                    address: account.address,
                    networkType: this.getNetworkType()
                });
                const toSignInputs = await this.formatOptionsToSignInputs(psbt);
                await this.signPsbt(psbt, toSignInputs, false);
                return await this.genSignPsbtUr(psbt.toHex());
            } catch (err) {
                throw new WalletControllerError(`Failed bip322-simple UR generation: ${String(err)}`, {
                    text,
                    msgType
                });
            }
        }
        const { account, keyring } = await this.checkKeyringMethod('genSignMsgUr');
        try {
            return await (keyring as KeystoneKeyring).genSignMsgUr(account.pubkey, text);
        } catch (err) {
            throw new WalletControllerError(`Failed to generate sign message UR: ${String(err)}`, {
                text,
                msgType
            });
        }
    };

    parseSignMsgUr = async (type: string, cbor: string, msgType: string) => {
        if (msgType === 'bip322-simple') {
            try {
                const res = await this.parseSignPsbtUr(type, cbor, false);
                const psbt = bitcoin.Psbt.fromHex(res.psbtHex);
                psbt.finalizeAllInputs();
                return {
                    signature: getSignatureFromPsbtOfBIP322Simple(psbt)
                };
            } catch (err) {
                throw new WalletControllerError(`Failed bip322-simple UR parsing: ${String(err)}`, {
                    type,
                    cbor
                });
            }
        }

        const { keyring } = await this.checkKeyringMethod('parseSignMsgUr');
        try {
            const sig = await (keyring as KeystoneKeyring).parseSignMsgUr(type, cbor);
            sig.signature = Buffer.from(sig.signature, 'hex').toString('base64');
            return sig;
        } catch (err) {
            throw new WalletControllerError(`Failed to parse sign message UR: ${String(err)}`, {
                type,
                cbor,
                msgType
            });
        }
    };

    getEnableSignData = () => {
        return preferenceService.getEnableSignData();
    };

    setEnableSignData = (enable: boolean) => {
        return preferenceService.setEnableSignData(enable);
    };

    getBuyBtcChannelList = async () => {
        return openapiService.getBuyBtcChannelList();
    };

    getAutoLockTimeId = () => {
        return preferenceService.getAutoLockTimeId();
    };

    setAutoLockTimeId = (timeId: number) => {
        preferenceService.setAutoLockTimeId(timeId);
        this._resetTimeout();
    };

    setLastActiveTime = () => {
        this._resetTimeout();
    };

    _resetTimeout = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        const timeId = preferenceService.getAutoLockTimeId();
        const timeConfig = AUTO_LOCKTIMES[timeId] || AUTO_LOCKTIMES[DEFAULT_LOCKTIME_ID];
        this.timer = setTimeout(async () => {
            try {
                await this.lockWallet();
            } catch (err) {
                console.error('Failed to auto-lock wallet:', err);
            }
        }, timeConfig.time) as unknown as number;
    };

    // OPNET RPC API
    getOpNetBalance = async (address: string): Promise<BitcoinBalance> => {
        try {
            const btcBalanceSpendable: bigint = await Web3API.getBalance(address, true);
            const btcBalanceTotal: bigint = await Web3API.getBalance(address, false);
            const btcBalanceTotalStr: string = bigIntToDecimal(btcBalanceTotal, 8);

            const inscriptionAmount: bigint = btcBalanceTotal - btcBalanceSpendable;
            const inscriptionAmountStr: string = bigIntToDecimal(inscriptionAmount, 8);

            return {
                confirm_amount: btcBalanceTotalStr,
                pending_amount: '0',
                amount: btcBalanceTotalStr,
                confirm_btc_amount: btcBalanceTotalStr,
                pending_btc_amount: '0',
                btc_amount: btcBalanceTotalStr,
                confirm_inscription_amount: '0',
                pending_inscription_amount: '0',
                inscription_amount: inscriptionAmountStr,
                usd_value: '0.00'
            };
        } catch (err) {
            throw new WalletControllerError(`Failed to get OPNET balance: ${String(err)}`, { address });
        }
    };

    private _getKeyringByType = (type: string): Keyring => {
        const found = keyringService.getKeyringsByType(type)[0];
        if (found) return found;
        throw new WalletControllerError(`No ${type} keyring found`);
    };

    private _generateAlianName = (type: string, index: number) => {
        return `${BRAND_ALIAN_TYPE_TEXT[type]} ${index}`;
    };
}

export default new WalletController();
