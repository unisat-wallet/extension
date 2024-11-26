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
import { SimpleKeyring } from '@btc-vision/wallet-sdk';
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
    boot = (password: string) => keyringService.boot(password);

    isBooted = () => keyringService.isBooted();

    hasVault = () => keyringService.hasVault();

    verifyPassword = (password: string) => keyringService.verifyPassword(password);

    changePassword = (password: string, newPassword: string) => keyringService.changePassword(password, newPassword);

    initAlianNames = async () => {
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
    };

    isReady = () => {
        return !!contactBookService.store;
    };

    unlock = async (password: string) => {
        const alianNameInited = preferenceService.getInitAlianNameStatus();
        const alianNames = contactBookService.listAlias();
        await keyringService.submitPassword(password);
        sessionService.broadcastEvent(SessionEvent.unlock);

        if (!alianNameInited && alianNames.length === 0) {
            await this.initAlianNames();
        }

        this._resetTimeout();
    };

    isUnlocked = () => {
        return keyringService.memStore.getState().isUnlocked;
    };

    lockWallet = async () => {
        await keyringService.setLocked();
        sessionService.broadcastEvent(SessionEvent.accountsChanged, []);
        sessionService.broadcastEvent(SessionEvent.lock);
        eventBus.emit(EVENTS.broadcastToUI, {
            method: 'lock',
            params: {}
        });
    };

    setPopupOpen = (isOpen: boolean) => {
        preferenceService.setPopupOpen(isOpen);
    };

    getAddressBalance = async (address: string) => {
        const data: BitcoinBalance = await this.getOpNetBalance(address);
        preferenceService.updateAddressBalance(address, data);

        return data;
    };

    getMultiAddressAssets = async (addresses: string): Promise<AddressSummary[]> => {
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
    };

    findGroupAssets = (groups: { type: number; address_arr: string[]; pubkey_arr: string[] }[]) => {
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
        // preferenceService.updateAddressHistory(address, data);
        // return data;
        //   todo
        return await openapiService.getAddressRecentHistory(params);
    };

    getAddressCacheHistory = (address: string | undefined) => {
        if (!address) return [];
        return preferenceService.getAddressHistory(address);
    };

    /* keyrings */

    getExternalLinkAck = () => {
        preferenceService.getExternalLinkAck();
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

    getInternalPrivateKey = (params: { pubkey: string; type: string }) => {
        const pubkey = params.pubkey;
        if (!pubkey) {
            throw new Error('No pubkey found in params');
        }

        const keyring = keyringService.getKeyringForAccount(pubkey, params.type);
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
            throw new Error('No mnemonic found');
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
            throw e;
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
            accountCount && tmpKeyring.addAccounts(accountCount);
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
        const originKeyring = await keyringService.createKeyringWithKeystone(
            urType,
            urCbor,
            addressType,
            hdPath,
            accountCount
        );

        if (filterPubkey !== null && filterPubkey !== undefined && filterPubkey.length > 0) {
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
    };

    removeKeyring = async (keyring: WalletKeyring) => {
        await keyringService.removeKeyring(keyring.index);
        const keyrings = await this.getKeyrings();
        const nextKeyring = keyrings[keyrings.length - 1];
        if (nextKeyring?.accounts[0]) {
            this.changeKeyring(nextKeyring);
            return nextKeyring;
        }
    };

    getKeyringByType = (type: string) => {
        return keyringService.getKeyringByType(type);
    };

    deriveNewAccountFromMnemonic = async (keyring: WalletKeyring, alianName?: string) => {
        const _keyring = keyringService.keyrings[keyring.index];
        const result = await keyringService.addNewAccount(_keyring);
        if (alianName) this.updateAlianName(result[0], alianName);

        const currentKeyring = await this.getCurrentKeyring();
        if (!currentKeyring) throw new Error('no current keyring');
        keyring = currentKeyring;
        this.changeKeyring(keyring, keyring.accounts.length - 1);
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
        const currentAccount = await this.getCurrentAccount();
        const currentKeyringIndex = preferenceService.getCurrentKeyringIndex();
        await keyringService.changeAddressType(currentKeyringIndex, addressType);

        const keyring = await this.getCurrentKeyring();
        if (!keyring) throw new Error('no current keyring');
        this.changeKeyring(keyring, currentAccount?.index);
    };

    signTransaction = (type: string, from: string, psbt: bitcoin.Psbt, inputs: ToSignInput[]) => {
        const keyring = keyringService.getKeyringForAccount(from, type);
        return keyringService.signTransaction(keyring, psbt, inputs);
    };

    formatOptionsToSignInputs = async (_psbt: string | bitcoin.Psbt, options?: SignPsbtOptions) => {
        const account = await this.getCurrentAccount();
        if (!account) throw new Error('no current account');

        let toSignInputs: ToSignInput[] = [];
        if (options?.toSignInputs) {
            // We expect userToSignInputs objects to be similar to ToSignInput interface,
            // but we allow address to be specified in addition to publicKey for convenience.
            toSignInputs = options.toSignInputs.map((input) => {
                const index = Number(input.index);
                if (isNaN(index)) throw new Error('invalid index in toSignInput');

                if (!(input as AddressUserToSignInput).address && !(input as PublicKeyUserToSignInput).publicKey) {
                    throw new Error('no address or public key in toSignInput');
                }

                if (
                    (input as AddressUserToSignInput).address &&
                    (input as AddressUserToSignInput).address != account.address
                ) {
                    throw new Error('invalid address in toSignInput');
                }

                if (
                    (input as PublicKeyUserToSignInput).publicKey &&
                    (input as PublicKeyUserToSignInput).publicKey != account.pubkey
                ) {
                    throw new Error('invalid public key in toSignInput');
                }

                const sighashTypes = input.sighashTypes?.map(Number);
                if (sighashTypes?.some(isNaN)) throw new Error('invalid sighash type in toSignInput');

                return {
                    index,
                    publicKey: account.pubkey,
                    sighashTypes,
                    disableTweakSigner: input.disableTweakSigner
                };
            });
        } else {
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
        if (!account) throw new Error('no current account');

        const keyring = await this.getCurrentKeyring();
        if (!keyring) throw new Error('no current keyring');
        const __keyring = keyringService.keyrings[keyring.index];

        const networkType = this.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);

        if (!toSignInputs) {
            // Compatibility with legacy code.
            toSignInputs = await this.formatOptionsToSignInputs(psbt);
        }

        psbt.data.inputs.forEach((v) => {
            const isNotSigned = !(v.finalScriptSig ?? v.finalScriptWitness);
            const isP2TR = keyring.addressType === AddressType.P2TR || keyring.addressType === AddressType.M44_P2TR;
            const lostInternalPubkey = !v.tapInternalKey;

            // Special measures taken for compatibility with certain applications.
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

        if (keyring.type === KEYRING_TYPE.KeystoneKeyring) {
            const _keyring = __keyring as KeystoneKeyring;
            if (!_keyring.mfp) {
                throw new Error('no mfp in keyring');
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

        psbt = keyringService.signTransaction(__keyring, psbt, toSignInputs);
        if (autoFinalized) {
            toSignInputs.forEach((v) => {
                // psbt.validateSignaturesOfInput(v.index, validator);
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
        if (!account) throw new Error('no current account');
        return keyringService.signMessage(account.pubkey, account.type, text);
    };

    signAndBroadcastInteraction = async (
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<[BroadcastedTransaction, BroadcastedTransaction, import('@btc-vision/transaction').UTXO[]]> => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new Error('no current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new Error('no current account');

        const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
        const utxos = interactionParameters.utxos.map((utxo) => {
            return {
                ...utxo,
                value:
                    (typeof utxo.value as unknown as string | bigint) === 'bigint'
                        ? utxo.value
                        : BigInt(utxo.value as unknown as string)
            };
        });

        const interactionParametersSubmit: IInteractionParameters = {
            from: interactionParameters.from, // From address
            to: interactionParameters.to, // To address
            utxos: utxos, // UTXOs
            signer: walletGet.keypair, // Signer
            network: Web3API.network, // Network
            feeRate: interactionParameters.feeRate, // Fee rate (satoshi per byte)
            priorityFee: BigInt(interactionParameters.priorityFee || 330n), // Priority fee (opnet)
            calldata: Buffer.from(interactionParameters.calldata as unknown as string, 'hex') // Calldata
        };

        const sendTransaction = await Web3API.transactionFactory.signInteraction(interactionParametersSubmit);
        const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransaction[0], false);

        if (!firstTransaction) {
            throw new Error('Error in Broadcast');
        }

        if (firstTransaction.error) {
            throw new Error(firstTransaction.error);
        }

        // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
        const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransaction[1], false);
        if (!secondTransaction) {
            throw new Error('Error in Broadcast');
        }

        if (secondTransaction.error) {
            throw new Error(secondTransaction.error);
        }

        return [firstTransaction, secondTransaction, sendTransaction[2]];
    };

    deployContract = async (params: IDeploymentParametersWithoutSigner) => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new Error('no current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new Error('no current account');

        const utxos = params.utxos.map((utxo) => {
            return {
                ...utxo,
                value:
                    (typeof utxo.value as unknown as string | bigint) === 'bigint'
                        ? utxo.value
                        : BigInt(utxo.value as unknown as string)
            };
        });

        const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
        const deployContractParameters: IDeploymentParameters = {
            ...params,
            utxos: utxos,
            signer: walletGet.keypair,
            network: Web3API.network,
            feeRate: Number(params.feeRate.toString()),
            priorityFee: BigInt(params.priorityFee || 0n) < 330n ? 330n : BigInt(params.priorityFee || 0n),
            bytecode:
                typeof params.bytecode === 'string' ? Buffer.from(params.bytecode, 'hex') : Buffer.from(params.bytecode)
        };

        return await Web3API.transactionFactory.signDeployment(deployContractParameters);
    };

    signInteraction = async (
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<[string, string, import('@btc-vision/transaction').UTXO[]]> => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new Error('no current account');

        const wifWallet = this.getInternalPrivateKey({
            pubkey: account.pubkey,
            type: account.type
        } as Account);

        if (!wifWallet) throw new Error('no current account');

        const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
        const utxos = interactionParameters.utxos.map((utxo) => {
            return {
                ...utxo,
                value:
                    (typeof utxo.value as unknown as string | bigint) === 'bigint'
                        ? utxo.value
                        : BigInt(utxo.value as unknown as string)
            };
        });

        const interactionParametersSubmit: IInteractionParameters = {
            from: interactionParameters.from, // From address
            to: interactionParameters.to, // To address
            utxos: utxos, // UTXOs
            signer: walletGet.keypair, // Signer
            network: Web3API.network, // Network
            feeRate: interactionParameters.feeRate, // Fee rate (satoshi per byte)
            priorityFee: BigInt(interactionParameters.priorityFee || 330n), // Priority fee (opnet)
            calldata: Buffer.from(interactionParameters.calldata as unknown as string, 'hex') // Calldata
        };

        return await Web3API.transactionFactory.signInteraction(interactionParametersSubmit);
    };

    broadcast = async (transactions: BroadcastTransactionOptions[]): Promise<BroadcastedTransaction[]> => {
        const broadcastedTransactions: BroadcastedTransaction[] = [];

        for (const transaction of transactions) {
            const broadcastedTransaction = await Web3API.provider.sendRawTransaction(transaction.raw, transaction.psbt);
            if (!broadcastedTransaction) {
                throw new Error('Error in Broadcast');
            }

            if (broadcastedTransaction.error) {
                throw new Error(broadcastedTransaction.error);
            }

            broadcastedTransactions.push(broadcastedTransaction);
        }

        return broadcastedTransactions;
    };

    signBIP322Simple = async (text: string) => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new Error('no current account');
        const networkType = this.getNetworkType();
        return signMessageOfBIP322Simple({
            message: text,
            address: account.address,
            networkType,
            wallet: this as unknown as AbstractWallet
        });
    };

    signData = (data: string, type: 'ecdsa' | 'schnorr' = 'ecdsa') => {
        const account = preferenceService.getCurrentAccount();
        if (!account) throw new Error('no current account');
        return keyringService.signData(account.pubkey, data, type);
    };

    requestKeyring = (type: string, methodName: string, keyringId: number | null, ...params: unknown[]) => {
        let keyring;
        if (keyringId !== null && keyringId !== undefined) {
            keyring = stashKeyrings[keyringId];
        } else {
            try {
                keyring = this._getKeyringByType(type);
            } catch {
                const Keyring = keyringService.getKeyringClassForType(type) as typeof SimpleKeyring | undefined;
                if (!Keyring) throw new Error('no keyring');
                keyring = new Keyring();
            }
        }

        // @ts-expect-error
        if (keyring[methodName]) {
            // @ts-expect-error
            return keyring[methodName].call(keyring, ...params);
        }
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

    getNetworkType = () => {
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
        Web3API.setNetwork(chainType);

        preferenceService.setChainType(chainType);
        await this.openapi.setEndpoints(CHAINS_MAP[chainType].endpoints);

        const currentAccount = await this.getCurrentAccount();
        const keyring = await this.getCurrentKeyring();
        if (!keyring) throw new Error('no current keyring');
        this.changeKeyring(keyring, currentAccount?.index);

        const chainInfo = getChainInfo(chainType);
        sessionService.broadcastEvent<SessionEvent.chainChanged>(SessionEvent.chainChanged, chainInfo);

        const network = this.getLegacyNetworkName();
        sessionService.broadcastEvent<SessionEvent.networkChanged>(SessionEvent.networkChanged, {
            network,
            chainType
        });
    };

    getChainType = (): ChainType => {
        return preferenceService.getChainType();
    };

    pushTx = async (rawtx: string) => {
        return await this.openapi.pushTx(rawtx);
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
        const keyring: WalletKeyring = {
            index,
            key,
            type,
            addressType,
            accounts,
            alianName,
            hdPath
        };
        return keyring;
    };

    getKeyrings = async (): Promise<WalletKeyring[]> => {
        const displayedKeyrings = await keyringService.getAllDisplayedKeyrings();
        const keyrings: WalletKeyring[] = [];

        for (const displayedKeyring of displayedKeyrings) {
            if (displayedKeyring.type === KEYRING_TYPE.Empty) {
                continue;
            }

            const keyring = this.displayedKeyringToWalletKeyring(displayedKeyring, displayedKeyring.index);
            keyrings.push(keyring);
        }

        return keyrings;
    };

    getCurrentKeyring = async () => {
        let currentKeyringIndex = preferenceService.getCurrentKeyringIndex();
        const displayedKeyrings = await keyringService.getAllDisplayedKeyrings();
        if (currentKeyringIndex === undefined) {
            const currentAccount = preferenceService.getCurrentAccount();
            for (let i = 0; i < displayedKeyrings.length; i++) {
                if (displayedKeyrings[i].type !== currentAccount?.type) {
                    continue;
                }
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
        let currentAccount: Account | undefined = undefined;
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
                    } else w.new = !(readAppTime && readAppTime > w.time);
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
            const network = this.getLegacyNetworkName();
            const chainType = this.getChainType();
            sessionService.broadcastEvent(
                SessionEvent.networkChanged,
                {
                    network,
                    chainType
                },
                data.origin
            );
        }
    };

    updateConnectSite = (origin: string, data: ConnectedSite) => {
        permissionService.updateConnectSite(origin, data);
        const network = this.getLegacyNetworkName();
        const chainType = this.getChainType();
        sessionService.broadcastEvent(
            SessionEvent.networkChanged,
            {
                network,
                chainType
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
                    address = bitcoinAddress
                        .fromOutputScript(inputData.witnessUtxo.script, network)
                        .toString();
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
            value: output.value,
        }));
    
        const totalInputValue = inputs.reduce((sum, input) => sum + input.value, 0);
        const totalOutputValue = outputs.reduce((sum, output) => sum + output.value, 0);
    
        const fee = totalInputValue - totalOutputValue;
    
        const transactionSize = psbt.toBuffer().length;
        const feeRate = transactionSize > 0 ? fee / transactionSize : 0;
    
        const rbfEnabled = psbt.txInputs.some((input) => input.sequence && input.sequence < 0xfffffffe);
    
        // TODO: Check if there is any way to find recommendedFeeRate
        const recommendedFeeRate = 1;
        const shouldWarnFeeRate = feeRate < recommendedFeeRate;
    
        return {
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
        // preferenceService.updateAddressBalance(address, data);
        return await openapiService.getAddressSummary(address);
    };

    setPsbtSignNonSegwitEnable(psbt: bitcoin.Psbt, enabled: boolean) {
         
        //@ts-expect-error
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = enabled;
    }

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
        if (!account) throw new Error('no current account');

        const keyring = keyringService.getKeyringForAccount(account.pubkey);
        if (!keyring) {
            throw new Error('keyring does not exist');
        }

        // @ts-expect-error
        if (!keyring[method]) {
            throw new Error(`keyring does not have ${method} method`);
        }

        return { account, keyring };
    };

    genSignPsbtUr = async (psbtHex: string) => {
        const { keyring } = await this.checkKeyringMethod('genSignPsbtUr');

        return await (keyring as KeystoneKeyring).genSignPsbtUr(psbtHex);
    };

    parseSignPsbtUr = async (type: string, cbor: string, isFinalize = true) => {
        const { keyring } = await this.checkKeyringMethod('parseSignPsbtUr');

        const psbtHex = await (keyring as KeystoneKeyring).parseSignPsbtUr(type, cbor);
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        isFinalize && psbt.finalizeAllInputs();
        return {
            psbtHex: psbt.toHex(),
            rawtx: isFinalize ? psbt.extractTransaction().toHex() : undefined
        };
    };

    genSignMsgUr = async (text: string, msgType?: string) => {
        if (msgType === 'bip322-simple') {
            const account = await this.getCurrentAccount();
            if (!account) throw new Error('no current account');
            const psbt = genPsbtOfBIP322Simple({
                message: text,
                address: account.address,
                networkType: this.getNetworkType()
            });
            const toSignInputs = await this.formatOptionsToSignInputs(psbt);
            await this.signPsbt(psbt, toSignInputs, false);
            return await this.genSignPsbtUr(psbt.toHex());
        }
        const { account, keyring } = await this.checkKeyringMethod('genSignMsgUr');
        return await (keyring as KeystoneKeyring).genSignMsgUr(account.pubkey, text);
    };

    parseSignMsgUr = async (type: string, cbor: string, msgType: string) => {
        if (msgType === 'bip322-simple') {
            const res = await this.parseSignPsbtUr(type, cbor, false);
            const psbt = bitcoin.Psbt.fromHex(res.psbtHex);
            psbt.finalizeAllInputs();
            return {
                signature: getSignatureFromPsbtOfBIP322Simple(psbt)
            };
        }

        const { keyring } = await this.checkKeyringMethod('parseSignMsgUr');
        const sig = await (keyring as KeystoneKeyring).parseSignMsgUr(type, cbor);
        sig.signature = Buffer.from(sig.signature, 'hex').toString('base64');

        return sig;
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
            await this.lockWallet();
        }, timeConfig.time) as unknown as number;
    };

    //OPNET RPC API
    getOpNetBalance = async (address: string): Promise<BitcoinBalance> => {
        const btcBalanceSpendable: bigint = await Web3API.getBalance(address, true); //await openapiService.getOPNetBalance(address);

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
    };

    private _getKeyringByType = (type: string): Keyring => {
        const keyring = keyringService.getKeyringsByType(type)[0];

        if (keyring) {
            return keyring;
        }

        throw new Error(`No ${type} keyring found`);
    };

    private _generateAlianName = (type: string, index: number) => {
        return `${BRAND_ALIAN_TYPE_TEXT[type]} ${index}`;
    };
}

export default new WalletController();
