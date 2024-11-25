import { permissionService, sessionService } from '@/background/service';
import { CHAINS, CHAINS_MAP, ChainType, NETWORK_TYPES, VERSION } from '@/shared/constant';

import { Session } from '@/background/service/session';
import { IDeploymentParametersWithoutSigner } from '@/content-script/pageProvider/Web3Provider';
import { SessionEvent } from '@/shared/interfaces/SessionEvent';
import { providerErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { NetworkType } from '@/shared/types';
import { ProviderControllerRequest } from '@/shared/types/Request.js';
import { getChainInfo } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { DetailedInteractionParameters } from '@/shared/web3/interfaces/DetailedInteractionParameters';
import { amountToSatoshis } from '@/ui/utils';
import { bitcoin } from '@btc-vision/wallet-sdk/lib/bitcoin-core';
import { verifyMessageOfBIP322Simple } from '@btc-vision/wallet-sdk/lib/message';
import { toPsbtNetwork } from '@btc-vision/wallet-sdk/lib/network';
import BaseController from '../base';
import wallet from '../wallet';

function formatPsbtHex(psbtHex: string) {
    let formatData = '';
    try {
        if (!/^[0-9a-fA-F]+$/.test(psbtHex)) {
            formatData = bitcoin.Psbt.fromBase64(psbtHex).toHex();
        } else {
            bitcoin.Psbt.fromHex(psbtHex);
            formatData = psbtHex;
        }
    } catch (e) {
        throw new Error('invalid psbt');
    }
    return formatData;
}

function objToBuffer(obj: object): Uint8Array {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    const buffer = new Uint8Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        buffer[i] = values[i];
    }

    return buffer;
}

class ProviderController extends BaseController {
    requestAccounts = async (params: { session: Session }) => {
        const origin = params.session.origin;
        if (!permissionService.hasPermission(origin)) {
            throw providerErrors.unauthorized();
        }

        const _account = await wallet.getCurrentAccount();
        const account = _account ? [_account.address] : [];
        sessionService.broadcastEvent(SessionEvent.accountsChanged, account);

        const connectSite = permissionService.getConnectedSite(origin);
        if (connectSite) {
            const network = wallet.getLegacyNetworkName();
            sessionService.broadcastEvent(
                SessionEvent.networkChanged,
                {
                    network,
                    chainType: wallet.getChainType()
                },
                origin
            );
        }
        return account;
    };

    disconnect = () => {
        wallet.removeConnectedSite(origin);
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getAccounts = async ({ session: { origin } }: { session: { origin: string } }) => {
        if (!permissionService.hasPermission(origin)) {
            return [];
        }

        const _account = await wallet.getCurrentAccount();
        return _account ? [_account.address] : [];
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getNetwork = () => {
        return wallet.getLegacyNetworkName();
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'SwitchNetwork',
        (req) => {
            const network = req.data.params.network;
            if (NETWORK_TYPES[NetworkType.MAINNET].validNames.includes(network)) {
                req.data.params.networkType = NetworkType.MAINNET;
            } else if (NETWORK_TYPES[NetworkType.TESTNET].validNames.includes(network)) {
                req.data.params.networkType = NetworkType.TESTNET;
            } else if (NETWORK_TYPES[NetworkType.REGTEST].validNames.includes(network)) {
                req.data.params.networkType = NetworkType.REGTEST;
            } else {
                throw new Error(
                    `the network is invalid, supported networks: ${NETWORK_TYPES.map((v) => v.name).join(',')}`
                );
            }

            if (req.data.params.networkType === wallet.getNetworkType()) {
                // skip approval
                return true;
            }
        }
    ])
    switchNetwork = async (req: {
        data: {
            params: {
                networkType: NetworkType;
            };
        };
    }) => {
        const {
            data: {
                params: { networkType }
            }
        }: {
            data: {
                params: {
                    networkType: NetworkType;
                };
            };
        } = req;

        await wallet.setNetworkType(networkType);
        return NETWORK_TYPES[networkType].name;
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getChain = () => {
        const chainType = wallet.getChainType();
        return getChainInfo(chainType);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'SwitchChain',
        (req) => {
            const chainType: ChainType = req.data.params.chain as ChainType;
            if (!CHAINS_MAP[chainType]) {
                throw new Error(`the chain is invalid, supported chains: ${CHAINS.map((v) => v.enum).join(',')}`);
            }

            if (chainType == wallet.getChainType()) {
                // skip approval
                return true;
            }
        }
    ])
    switchChain = async (req: {
        data: {
            params: {
                chain: string;
            };
        };
    }) => {
        const {
            data: {
                params: { chain }
            }
        }: {
            data: {
                params: {
                    chain: string;
                };
            };
        } = req;

        await wallet.setChainType(chain as ChainType);
        return getChainInfo(chain as ChainType);
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getPublicKey = async () => {
        const account = await wallet.getCurrentAccount();
        if (!account) return '';
        return account.pubkey;
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getBalance = async () => {
        const account = await wallet.getCurrentAccount();
        if (!account) return null;

        const balance = await wallet.getAddressBalance(account.address);
        return {
            confirmed: amountToSatoshis(balance.confirm_amount),
            unconfirmed: amountToSatoshis(balance.pending_amount),
            total: amountToSatoshis(balance.amount)
        };
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    verifyMessageOfBIP322Simple = (req: {
        data: {
            params: {
                address: string;
                message: string;
                signature: string;
                network: NetworkType | undefined;
            };
        };
    }) => {
        const {
            data: { params }
        } = req;
        return verifyMessageOfBIP322Simple(params.address, params.message, params.signature, params.network) ? 1 : 0;
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', ['SignPsbt', (_req: ProviderControllerRequest) => {
        //const { data: { params: { toAddress, satoshis } } } = req;
    }])
    sendBitcoin = async ({ approvalRes: { psbtHex } }: {
        approvalRes: { psbtHex: string }
    }) => {
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', ['SignPsbt', (_req: ProviderControllerRequest) => {
        //const { data: { params: { toAddress, satoshis } } } = req;
    }])
    sendInscription = async ({ approvalRes: { psbtHex } }: {
        approvalRes: { psbtHex: string }
    }) => {
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', ['SignInteraction', (_req: ProviderControllerRequest) => {
        const interactionParams = _req.data.params as DetailedInteractionParameters;
        if (!Web3API.isValidAddress(interactionParams.interactionParameters.to)) {
            throw new Error('Invalid contract address. Are you on the right network / are you using segwit?');
        }

            interactionParams.network = wallet.getChainType();
        }
    ])
    signAndBroadcastInteraction = async (request: {
        approvalRes: boolean;
        data: { params: DetailedInteractionParameters };
    }) => {
        return wallet.signAndBroadcastInteraction(request.data.params.interactionParameters);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', ['SignInteraction', (_req: ProviderControllerRequest) => {
        const interactionParams = _req.data.params as DetailedInteractionParameters;
        if (!Web3API.isValidAddress(interactionParams.interactionParameters.to)) {
            throw new Error('Invalid contract address. Are you on the right network / are you using segwit?');
        }

            interactionParams.network = wallet.getChainType();
        }
    ])
    signInteraction = async (request: { approvalRes: boolean; data: { params: DetailedInteractionParameters } }) => {
        return wallet.signInteraction(request.data.params.interactionParameters);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', ['SignDeployment', (_req: ProviderControllerRequest) => {
        const interactionParams = _req.data.params as IDeploymentParametersWithoutSigner;
        if (!interactionParams.bytecode) {
            throw new Error('Invalid bytecode');
        }

        if (!interactionParams.utxos || !interactionParams.utxos.length) {
            throw new Error('No utxos');
        }

        if (!interactionParams.feeRate) {
            throw new Error('No feeRate');
        }

        // @ts-expect-error
        interactionParams.priorityFee = BigInt(interactionParams.priorityFee);

        // @ts-expect-error
        interactionParams.bytecode = objToBuffer(interactionParams.bytecode);
        }
    ])
    deployContract = async (request: {
        approvalRes: boolean;
        data: { params: IDeploymentParametersWithoutSigner };
    }) => {
        const feeRate = await wallet.getFeeSummary();
        const rate = feeRate.list[2] || feeRate.list[1] || feeRate.list[0];

        if (Number(request.data.params.feeRate) < Number(rate.feeRate)) {
            // @ts-expect-error
            request.data.params.feeRate = Number(rate.feeRate);

            console.warn(
                'The fee rate is too low, the system will automatically adjust the fee rate to the minimum value'
            );
        }

        // @ts-expect-error
        request.data.params.bytecode = objToBuffer(request.data.params.bytecode);

        // @ts-expect-error
        request.data.params.priorityFee = BigInt(request.data.params.priorityFee);

        console.log('deployContract', request.data.params);

        return wallet.deployContract(request.data.params);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'SignText',
        () => {
            // todo check text
        }
    ])
    signMessage = async ({
        data: {
            params: { text, type }
        },
        approvalRes
    }: {
        data: { params: { text: string; type: 'bip322-simple' | 'ecdsa' | 'schnorr' } };
        approvalRes: { signature: string };
    }) => {
        if (approvalRes?.signature) {
            return approvalRes.signature;
        }
        if (type === 'bip322-simple') {
            return wallet.signBIP322Simple(text);
        } else {
            return wallet.signMessage(text);
        }
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'SignData',
        () => {
            // todo check text
        }
    ])
    signData = ({
        data: {
            params: { data, type }
        }
    }: {
        data: { params: { data: string; type: 'ecdsa' | 'schnorr' } };
    }) => {
        return wallet.signData(data, type);
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    pushTx = async ({
        data: {
            params: { rawtx }
        }
    }: {
        data: { params: { rawtx: string } };
    }) => {
        return await wallet.pushTx(rawtx);
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'SignPsbt',
        (req) => {
            const {
                data: {
                    params: { psbtHex }
                }
            } = req;
            req.data.params.psbtHex = formatPsbtHex(psbtHex);
        }
    ])
    signPsbt = async ({
        data: {
            params: { psbtHex, options }
        },
        approvalRes
    }: {
        data: {
            params: {
                psbtHex: string;
                options: { autoFinalized: boolean };
            };
        };
        approvalRes: { signed: boolean; psbtHex: string };
    }) => {
        if (approvalRes?.signed) {
            return approvalRes.psbtHex;
        }

        const networkType = wallet.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);
        const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork });
        const autoFinalized = !(options && !options.autoFinalized);
        const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
        await wallet.signPsbt(psbt, toSignInputs, autoFinalized);

        return psbt.toHex();
    };

    // @ts-expect-error
    @Reflect.metadata('APPROVAL', [
        'MultiSignPsbt',
        (req) => {
            const {
                data: {
                    params: { psbtHexs }
                }
            }: {
                data: {
                    params: {
                        psbtHexs: string[];
                        options: { autoFinalized: boolean }[];
                    };
                };
            } = req;

            req.data.params.psbtHexs = psbtHexs.map((psbtHex) => formatPsbtHex(psbtHex));
        }
    ])
    multiSignPsbt = async ({
        data: {
            params: { psbtHexs, options }
        }
    }: {
        data: {
            params: {
                psbtHexs: string[];
                options: { autoFinalized: boolean }[];
            };
        };
    }) => {
        const account = await wallet.getCurrentAccount();
        if (!account) throw new Error('No account');
        const networkType = wallet.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);
        const result: string[] = [];
        for (let i = 0; i < psbtHexs.length; i++) {
            const psbt = bitcoin.Psbt.fromHex(psbtHexs[i], { network: psbtNetwork });
            const autoFinalized = options?.[i]?.autoFinalized ?? true;
            const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHexs[i], options[i]);
            await wallet.signPsbt(psbt, toSignInputs, autoFinalized);
            result.push(psbt.toHex());
        }
        return result;
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    pushPsbt = async ({
        data: {
            params: { psbtHex }
        }
    }: {
        data: { params: { psbtHex: string } };
    }) => {
        const hexData = formatPsbtHex(psbtHex);
        const psbt = bitcoin.Psbt.fromHex(hexData);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getVersion = () => {
        return VERSION;
    };

    // @ts-expect-error
    @Reflect.metadata('SAFE', true)
    getBitcoinUtxos = async () => {
        try {
            const account = await wallet.getCurrentAccount();
            if (!account) return [];
            return await Web3API.getUTXOs([account.address]);
        } catch (e) {
            console.error(e);
            return [];
        }
    };
}

export default new ProviderController();
