import { permissionService, sessionService } from '@/background/service';
import { CHAINS, CHAINS_MAP, NETWORK_TYPES, VERSION } from '@/shared/constant';
import { NetworkType } from '@/shared/types';
import { getChainInfo, objToUint8Array } from '@/shared/utils';
import { amountToSatoshis } from '@/ui/utils';
import * as encoding from '@cosmjs/encoding';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';
import { verifyMessageOfBIP322Simple } from '@unisat/wallet-sdk/lib/message';
import { toPsbtNetwork } from '@unisat/wallet-sdk/lib/network';
import { ethErrors } from 'eth-rpc-errors';
import BaseController from '../base';
import wallet from '../wallet';

import { encodeSecp256k1Signature, makeADR36AminoSignDoc, serializeSignDoc } from '@/background/service/keyring/CosmosKeyring';
import { makeSignBytes } from '@cosmjs/proto-signing';

function formatPsbtHex(psbtHex: string) {
  let formatData = '';
  try {
    if (!(/^[0-9a-fA-F]+$/.test(psbtHex))) {
      formatData = bitcoin.Psbt.fromBase64(psbtHex).toHex()
    } else {
      bitcoin.Psbt.fromHex(psbtHex);
      formatData = psbtHex;
    }
  } catch (e) {
    throw new Error('invalid psbt')
  }
  return formatData;
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
      const network = wallet.getLegacyNetworkName()
      sessionService.broadcastEvent(
        'networkChanged',
        {
          network
        },
        origin
      );
    }
    return account
  };

  disconnect = async ({ session: { origin } }) => {
    wallet.removeConnectedSite(origin)
  };

  @Reflect.metadata('SAFE', true)
  getAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      return [];
    }

    const _account = await wallet.getCurrentAccount();
    const account = _account ? [_account.address] : [];
    return account
  };

  @Reflect.metadata('SAFE', true)
  getNetwork = async () => {
    return wallet.getLegacyNetworkName()
  };

  @Reflect.metadata('APPROVAL', ['SwitchNetwork', (req) => {
    const network = req.data.params.network;
    if (NETWORK_TYPES[NetworkType.MAINNET].validNames.includes(network)) {
      req.data.params.networkType = NetworkType.MAINNET
    } else if (NETWORK_TYPES[NetworkType.TESTNET].validNames.includes(network)) {
      req.data.params.networkType = NetworkType.TESTNET
    } else {
      throw new Error(`the network is invalid, supported networks: ${NETWORK_TYPES.map(v => v.name).join(',')}`)
    }

    if (req.data.params.networkType === wallet.getNetworkType()) {
      // skip approval
      return true;
    }
  }])
  switchNetwork = async (req) => {
    const { data: { params: { networkType } } } = req;
    wallet.setNetworkType(networkType)
    return NETWORK_TYPES[networkType].name
  }


  @Reflect.metadata('SAFE', true)
  getChain = async () => {
    const chainType = wallet.getChainType()
    return getChainInfo(chainType)
  };

  @Reflect.metadata('APPROVAL', ['SwitchChain', (req) => {
    const chainType = req.data.params.chain;
    if(!CHAINS_MAP[chainType]){
      throw new Error(`the chain is invalid, supported chains: ${CHAINS.map(v => v.enum).join(',')}`)
    }

    if (chainType == wallet.getChainType()) {
      // skip approval
      return true;
    }
  }])
  switchChain = async (req) => {
    const { data: { params: { chain } } } = req;
    wallet.setChainType(chain)
    return getChainInfo(chain)
  }

  @Reflect.metadata('SAFE', true)
  getPublicKey = async () => {
    const account = await wallet.getCurrentAccount();
    if (!account) return ''
    return account.pubkey;
  };

  @Reflect.metadata('SAFE', true)
  getInscriptions = async (req) => {
    const { data: { params: { cursor, size } } } = req;
    const account = await wallet.getCurrentAccount();
    if (!account) return ''
    const { list, total } = await wallet.openapi.getAddressInscriptions(account.address, cursor, size);
    return { list, total };
  };

  @Reflect.metadata('SAFE', true)
  getBalance = async () => {
    const account = await wallet.getCurrentAccount();
    if (!account) return null;
    const balance = await wallet.getAddressBalance(account.address)
    return {
      confirmed: amountToSatoshis(balance.confirm_amount),
      unconfirmed: amountToSatoshis(balance.pending_amount),
      total: amountToSatoshis(balance.amount)
    };
  };

  @Reflect.metadata('SAFE', true)
  getBalanceV2 = async () => {
    const account = await wallet.getCurrentAccount();
    if (!account) return null;
    const balance = await wallet.getAddressBalanceV2(account.address)
    return {
      available: balance.availableBalance,
      unavailable: balance.unavailableBalance,
      total: balance.totalBalance
    };
  };

  @Reflect.metadata('SAFE', true)
  verifyMessageOfBIP322Simple = async (req) => {
    const { data: { params } } = req;
    return verifyMessageOfBIP322Simple(params.address, params.message, params.signature, params.network) ? 1 : 0;
  }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    // todo check
  }])
  sendBitcoin = async ({ approvalRes: { psbtHex } }) => {
    const psbt = bitcoin.Psbt.fromHex(psbtHex);
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex()
    return await wallet.pushTx(rawtx)
  }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    // todo check
  }])
  sendInscription = async ({ approvalRes: { psbtHex } }) => {
    const psbt = bitcoin.Psbt.fromHex(psbtHex);
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex()
    return await wallet.pushTx(rawtx)
  }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    // todo check
  }])
  sendRunes = async ({ approvalRes: { psbtHex } }) => {
    const psbt = bitcoin.Psbt.fromHex(psbtHex);
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex()
    return await wallet.pushTx(rawtx)
  }

  @Reflect.metadata('APPROVAL', ['SignText', (req) => {
    // todo check text
  }])
  signMessage = async ({ data: { params: { text, type } }, approvalRes }) => {
    if (approvalRes?.signature) {
      return approvalRes.signature
    }
    if (type === 'bip322-simple') {
      return wallet.signBIP322Simple(text)
    } else {
      return wallet.signMessage(text)
    }
  }

  @Reflect.metadata('APPROVAL', ['SignData', () => {
    // todo check text
  }])
  signData = async ({ data: { params: { data, type } } }) => {
    return wallet.signData(data, type)
  }

  // @Reflect.metadata('APPROVAL', ['SignTx', () => {
  //   // todo check
  // }])
  //   signTx = async () => {
  //     // todo
  //   }

  @Reflect.metadata('SAFE', true)
  pushTx = async ({ data: { params: { rawtx } } }) => {
    return await wallet.pushTx(rawtx)
  }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    const { data: { params: { psbtHex } } } = req;
    req.data.params.psbtHex = formatPsbtHex(psbtHex);
  }])
  signPsbt = async ({ data: { params: { psbtHex, options } }, approvalRes }) => {
    if (approvalRes && approvalRes.signed==true) {
      return approvalRes.psbtHex
    }
    const networkType = wallet.getNetworkType()
    const psbtNetwork = toPsbtNetwork(networkType)
    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork })
    const autoFinalized = (options && options.autoFinalized == false) ? false : true;
    const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
    await wallet.signPsbt(psbt, toSignInputs, autoFinalized);
    return psbt.toHex();
  }

  @Reflect.metadata('APPROVAL', ['MultiSignPsbt', (req) => {
    const { data: { params: { psbtHexs, options } } } = req;
    req.data.params.psbtHexs = psbtHexs.map(psbtHex => formatPsbtHex(psbtHex));
  }])
  multiSignPsbt = async ({ data: { params: { psbtHexs, options } } }) => {
    const account = await wallet.getCurrentAccount();
    if (!account) throw null;
    const networkType = wallet.getNetworkType()
    const psbtNetwork = toPsbtNetwork(networkType)
    const result: string[] = [];
    for (let i = 0; i < psbtHexs.length; i++) {
      const psbt = bitcoin.Psbt.fromHex(psbtHexs[i], { network: psbtNetwork });
      const autoFinalized = (options && options[i] && options[i].autoFinalized == false) ? false : true;
      const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHexs[i], options[i]);
      await wallet.signPsbt(psbt, toSignInputs, autoFinalized);
      result.push(psbt.toHex())
    }
    return result;
  }


  @Reflect.metadata('APPROVAL', ['MultiSignMessage', (req) => {
    const { data: { params: { messages } } } = req;
    req.data.params.messages = messages.map(message => ({
      text: message.text,
      type: message.type
    }));
  }])
  multiSignMessage = async ({ data: { params: { messages } } }) => {
    const account = await wallet.getCurrentAccount();
    if (!account) throw null;
    const networkType = wallet.getNetworkType()
    const psbtNetwork = toPsbtNetwork(networkType)
    const result: string[] = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.type === 'bip322-simple') {
        result.push(await wallet.signBIP322Simple(message.text))
      } else {
        result.push(await wallet.signMessage(message.text))
      }
    }
    return result;
  }

  @Reflect.metadata('SAFE', true)
  pushPsbt = async ({ data: { params: { psbtHex } } }) => {
    const hexData = formatPsbtHex(psbtHex);
    const psbt = bitcoin.Psbt.fromHex(hexData);
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex()
    return await wallet.pushTx(rawtx)
  }

  @Reflect.metadata('APPROVAL', ['InscribeTransfer', (req) => {
    const { data: { params: { ticker } } } = req;
    // todo
  }])
  inscribeTransfer = async ({ approvalRes }) => {
    return approvalRes
  }

  @Reflect.metadata('SAFE', true)
  getVersion = async () => {
    return VERSION
  };

  @Reflect.metadata('SAFE', true)
  isAtomicalsEnabled = async () => {
    return await wallet.isAtomicalsEnabled()
  };

  @Reflect.metadata('SAFE', true)
  getBitcoinUtxos = async () => {
    const account = await wallet.getCurrentAccount();
    if (!account) return [];
    const utxos = await wallet.getBTCUtxos()
    return utxos;
  };


  private _isKeystoneWallet = async () => {
    const currentKeyring = await wallet.getCurrentKeyring();
    return currentKeyring?.type === 'keystone';
  }


  @Reflect.metadata('APPROVAL', ['CosmosConnect', (req) => {
    // todo check
  }])
  cosmosEnable = async ( {data:{params:{chainId}}} ) => {
    if(!wallet.cosmosChainInfoMap[chainId]){
      throw new Error('Not supported chainId')
    }
  };


  @Reflect.metadata('SAFE', true)
  cosmosExperimentalSuggestChain = async ( {data:{params:{chainData}}} ) => {
    // const chainInfo:CosmosChainInfo = chainData;
    // if(chainInfo.chainId && !wallet.cosmosChainInfoMap[chainInfo.chainId]){
    //   wallet.cosmosChainInfoMap[chainInfo.chainId] = chainInfo;
    // }

    throw new Error('not implemented')
  }


  @Reflect.metadata('SAFE', true)
  cosmosGetKey = async ({ data: { params: { chainId} } }) => {
    const cosmosKeyring = await wallet.getCosmosKeyring(chainId);
      if(!cosmosKeyring){
        return null;
      }

      const key = cosmosKeyring.getKey();
      const _key = Object.assign({},key,{
        address:key.address.toString(),
        pubKey:key.pubKey.toString()
      });
      return _key;
  }


  @Reflect.metadata('APPROVAL', ['CosmosSign', (req) => {
    const signDoc = req.data.params.signDoc;
    signDoc.bodyBytes = objToUint8Array(signDoc.bodyBytes);
    signDoc.authInfoBytes = objToUint8Array(signDoc.authInfoBytes);
    const signBytes = makeSignBytes(signDoc);
    req.data.params.signBytesHex = encoding.toHex(signBytes);

  }])
  cosmosSignDirect = async ({ data: { params: msg } ,approvalRes}) => {
    if (!approvalRes) {
      throw new Error('approvalRes is required')
    }
    const {bodyBytes,authInfoBytes,chainId,accountNumber} = msg.signDoc;
    const signature = encodeSecp256k1Signature(encoding.fromHex(approvalRes.publicKey),  encoding.fromHex(approvalRes.signature));
    const respone = {
      signed: {
        bodyBytes:objToUint8Array(bodyBytes),
        authInfoBytes:objToUint8Array(authInfoBytes),
        chainId,
        accountNumber,
      },
      signature
    } ;
    return respone;

  }

  @Reflect.metadata('APPROVAL', ['CosmosSign', (req) => {
    const signerAddress = req.data.params.signerAddress;
    const data = req.data.params.data;
    const signDoc = makeADR36AminoSignDoc(signerAddress, data);
    const signBytes = serializeSignDoc(signDoc);
    req.data.params.signBytesHex = encoding.toHex(signBytes);
  }])
  cosmosSignArbitrary = async ({ data: { params:msg } ,approvalRes}) => {
    if (!approvalRes) {
      throw new Error('approvalRes is required')
    }

    const signature = encodeSecp256k1Signature(encoding.fromHex(approvalRes.publicKey),  encoding.fromHex(approvalRes.signature));
    const respone =  signature
    return respone;

  }




}

export default new ProviderController();
