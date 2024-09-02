import { permissionService, sessionService } from '@/background/service';
import { CHAINS, CHAINS_MAP, NETWORK_TYPES, VERSION } from '@/shared/constant';

import { NetworkType } from '@/shared/types';
import { RequestData } from '@/shared/types/Request.js';
import { getChainInfo } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { DetailedInteractionParameters } from '@/shared/web3/interfaces/DetailedInteractionParameters';
import { amountToSatoshis } from '@/ui/utils';
import { bitcoin } from '@btc-vision/wallet-sdk/lib/bitcoin-core';
import { verifyMessageOfBIP322Simple } from '@btc-vision/wallet-sdk/lib/message';
import { toPsbtNetwork } from '@btc-vision/wallet-sdk/lib/network';
import { ethErrors } from 'eth-rpc-errors';
import BaseController from '../base';
import wallet from '../wallet';
import { IDeploymentParametersWithoutSigner } from '@/content-script/pageProvider/Web3Provider';

function formatPsbtHex(psbtHex: string) {
    let formatData = '';
    try {
        if (!(/^[0-9a-fA-F]+$/.test(psbtHex))) {
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

    requestAccounts = async ({ session: { origin } }) => {
        if (!permissionService.hasPermission(origin)) {
            throw ethErrors.provider.unauthorized();
        }

        const _account = await wallet.getCurrentAccount();
        const account = _account ? [_account.address] : [];
        sessionService.broadcastEvent('accountsChanged', account);
        const connectSite = permissionService.getConnectedSite(origin);
        if (connectSite) {
            const network = wallet.getLegacyNetworkName();
            sessionService.broadcastEvent(
                'networkChanged',
                {
                    network,
                    chain: wallet.getChainType()
                },
                origin
            );
        }
        return account;
    };

    disconnect = async ({ session: { origin } }) => {
        wallet.removeConnectedSite(origin);
    };

    @Reflect.metadata('SAFE', true)
    getAccounts = async ({ session: { origin } }) => {
        if (!permissionService.hasPermission(origin)) {
            return [];
        }

        const _account = await wallet.getCurrentAccount();
        const account = _account ? [_account.address] : [];
        return account;
    };

    @Reflect.metadata('SAFE', true)
    getNetwork = async () => {
        return wallet.getLegacyNetworkName();
    };

    @Reflect.metadata('APPROVAL', ['SwitchNetwork', (req) => {
        const network = req.data.params.network;
        if (NETWORK_TYPES[NetworkType.MAINNET].validNames.includes(network)) {
            req.data.params.networkType = NetworkType.MAINNET;
        } else if (NETWORK_TYPES[NetworkType.TESTNET].validNames.includes(network)) {
            req.data.params.networkType = NetworkType.TESTNET;
        } else if (NETWORK_TYPES[NetworkType.REGTEST].validNames.includes(network)) {
            req.data.params.networkType = NetworkType.REGTEST;
        } else {
            throw new Error(`the network is invalid, supported networks: ${NETWORK_TYPES.map(v => v.name).join(',')}`);
        }

        if (req.data.params.networkType === wallet.getNetworkType()) {
            // skip approval
            return true;
        }
    }])
    switchNetwork = async (req) => {
        const { data: { params: { networkType } } } = req;
        await wallet.setNetworkType(networkType);
        return NETWORK_TYPES[networkType].name;
    };

    @Reflect.metadata('SAFE', true)
    getChain = async () => {
        const chainType = wallet.getChainType();
        return getChainInfo(chainType);
    };

    @Reflect.metadata('APPROVAL', ['SwitchChain', (req) => {
        const chainType = req.data.params.chain;
        if (!CHAINS_MAP[chainType]) {
            throw new Error(`the chain is invalid, supported chains: ${CHAINS.map(v => v.enum).join(',')}`);
        }

        if (chainType == wallet.getChainType()) {
            // skip approval
            return true;
        }
    }])
    switchChain = async (req) => {
        const { data: { params: { chain } } } = req;
        await wallet.setChainType(chain);
        return getChainInfo(chain);
    };

    @Reflect.metadata('SAFE', true)
    getPublicKey = async () => {
        const account = await wallet.getCurrentAccount();
        if (!account) return '';
        return account.pubkey;
    };

    @Reflect.metadata('SAFE', true)
    getInscriptions = async (req) => {
        const { data: { params: { cursor, size } } } = req;
        const account = await wallet.getCurrentAccount();
        if (!account) return '';
        const { list, total } = await wallet.openapi.getAddressInscriptions(account.address, cursor, size);
        return { list, total };
    };

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

    @Reflect.metadata('SAFE', true)
    verifyMessageOfBIP322Simple = async (req) => {
        const { data: { params } } = req;
        return verifyMessageOfBIP322Simple(params.address, params.message, params.signature, params.network) ? 1 : 0;
    };

    @Reflect.metadata('APPROVAL', ['SignPsbt', (_req: RequestData) => {
        //const { data: { params: { toAddress, satoshis } } } = req;
    }])
    sendBitcoin = async ({ approvalRes: { psbtHex } }) => {
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    @Reflect.metadata('APPROVAL', ['SignPsbt', (_req: RequestData) => {
        //const { data: { params: { toAddress, satoshis } } } = req;
    }])
    sendInscription = async ({ approvalRes: { psbtHex } }) => {
        const psbt = bitcoin.Psbt.fromHex(psbtHex);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    @Reflect.metadata('APPROVAL', ['SignInteraction', (_req: RequestData) => {
        const interactionParams = _req.data.params as DetailedInteractionParameters;
        if (!Web3API.isValidPKHAddress(interactionParams.interactionParameters.to)) {
            throw new Error('Invalid contract address. Are you on the right network / are you using segwit?');
        }

        interactionParams.network = wallet.getChainType();
    }])
    signAndBroadcastInteraction = async (request: {
        approvalRes: boolean,
        data: { params: DetailedInteractionParameters }
    }) => {
        return wallet.signAndBroadcastInteraction(request.data.params.interactionParameters);
    };

    @Reflect.metadata('APPROVAL', ['SignInteraction', (_req: RequestData) => {
        const interactionParams = _req.data.params as DetailedInteractionParameters;
        if (!Web3API.isValidPKHAddress(interactionParams.interactionParameters.to)) {
            throw new Error('Invalid contract address. Are you on the right network / are you using segwit?');
        }

        interactionParams.network = wallet.getChainType();
    }])
    signInteraction = async (request: {
        approvalRes: boolean,
        data: { params: DetailedInteractionParameters }
    }) => {
        return wallet.signInteraction(request.data.params.interactionParameters);
    };

    @Reflect.metadata('APPROVAL', ['SignDeployment', (_req: RequestData) => {
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

        // @ts-ignore
        interactionParams.priorityFee = BigInt(interactionParams.priorityFee);

        // @ts-ignore
        interactionParams.bytecode = objToBuffer(interactionParams.bytecode);
    }])
    deployContract = async (request: {
        approvalRes: boolean,
        data: { params: IDeploymentParametersWithoutSigner }
    }) => {
        const feeRate = await wallet.getFeeSummary();
        const rate = feeRate.list[2] || feeRate.list[1] || feeRate.list[0];

        if (Number(request.data.params.feeRate) < Number(rate.feeRate)) {
            // @ts-ignore
            request.data.params.feeRate = Number(rate.feeRate);

            console.warn('The fee rate is too low, the system will automatically adjust the fee rate to the minimum value');
        }

        // @ts-ignore
        request.data.params.bytecode = objToBuffer(request.data.params.bytecode);

        // @ts-ignore
        request.data.params.priorityFee = BigInt(request.data.params.priorityFee);

        console.log('deployContract', request.data.params);

        return wallet.deployContract(request.data.params);
    };

    @Reflect.metadata('APPROVAL', ['SignText', () => {
        // todo check text
    }])
    signMessage = async ({ data: { params: { text, type } }, approvalRes }) => {
        if (approvalRes?.signature) {
            return approvalRes.signature;
        }
        if (type === 'bip322-simple') {
            return wallet.signBIP322Simple(text);
        } else {
            return wallet.signMessage(text);
        }
    };

    @Reflect.metadata('APPROVAL', ['SignData', () => {
        // todo check text
    }])
    signData = async ({ data: { params: { data, type } } }) => {
        return wallet.signData(data, type);
    };

    // @Reflect.metadata('APPROVAL', ['SignTx', () => {
    //   // todo check
    // }])
    //   signTx = async () => {
    //     // todo
    //   }

    @Reflect.metadata('SAFE', true)
    pushTx = async ({ data: { params: { rawtx } } }) => {
        return await wallet.pushTx(rawtx);
    };

    @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
        const { data: { params: { psbtHex } } } = req;
        req.data.params.psbtHex = formatPsbtHex(psbtHex);
    }])
    signPsbt = async ({ data: { params: { psbtHex, options } }, approvalRes }) => {
        if (approvalRes && approvalRes.signed == true) {
            return approvalRes.psbtHex;
        }
        const networkType = wallet.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);
        const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork });
        const autoFinalized = (options && options.autoFinalized == false) ? false : true;
        const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
        await wallet.signPsbt(psbt, toSignInputs, autoFinalized);
        return psbt.toHex();
    };

    @Reflect.metadata('APPROVAL', ['MultiSignPsbt', (req) => {
        const { data: { params: { psbtHexs, options } } } = req;
        req.data.params.psbtHexs = psbtHexs.map(psbtHex => formatPsbtHex(psbtHex));
    }])
    multiSignPsbt = async ({ data: { params: { psbtHexs, options } } }) => {
        const account = await wallet.getCurrentAccount();
        if (!account) throw null;
        const networkType = wallet.getNetworkType();
        const psbtNetwork = toPsbtNetwork(networkType);
        const result: string[] = [];
        for (let i = 0; i < psbtHexs.length; i++) {
            const psbt = bitcoin.Psbt.fromHex(psbtHexs[i], { network: psbtNetwork });
            const autoFinalized = (options && options[i] && options[i].autoFinalized == false) ? false : true;
            const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHexs[i], options[i]);
            await wallet.signPsbt(psbt, toSignInputs, autoFinalized);
            result.push(psbt.toHex());
        }
        return result;
    };


    @Reflect.metadata('SAFE', true)
    pushPsbt = async ({ data: { params: { psbtHex } } }) => {
        const hexData = formatPsbtHex(psbtHex);
        const psbt = bitcoin.Psbt.fromHex(hexData);
        const tx = psbt.extractTransaction();
        const rawtx = tx.toHex();
        return await wallet.pushTx(rawtx);
    };

    @Reflect.metadata('APPROVAL', ['InscribeTransfer', (req) => {
        const { data: { params: { ticker } } } = req;
        // todo
    }])
    inscribeTransfer = async ({ approvalRes }) => {
        return approvalRes;
    };

    @Reflect.metadata('SAFE', true)
    getVersion = async () => {
        return VERSION;
    };

    @Reflect.metadata('SAFE', true)
    isAtomicalsEnabled = async () => {
        return await wallet.isAtomicalsEnabled();
    };

    @Reflect.metadata('SAFE', true)
    getBitcoinUtxos = async () => {
        const account = await wallet.getCurrentAccount();
        if (!account) return [];
        const utxos = await wallet.getBTCUtxos();
        return utxos;
    };
}

export default new ProviderController();
