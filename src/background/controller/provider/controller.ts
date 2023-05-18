
import { permissionService, sessionService } from '@/background/service';
import { NETWORK_TYPES } from '@/shared/constant';

import BaseController from '../base';
import wallet from '../wallet';
import { toPsbtNetwork } from '@/background/utils/tx-utils';
import { NetworkType } from '@/shared/types';
import { Psbt } from 'bitcoinjs-lib';
import { amountToSaothis } from '@/ui/utils';
import { ethErrors } from 'eth-rpc-errors';



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
      const network = wallet.getNetworkName()
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
      const networkType = wallet.getNetworkType()
      return NETWORK_TYPES[networkType].name
    };

  @Reflect.metadata('APPROVAL', ['SwitchNetwork', (req) => {
    const network = req.data.params.network;
    if ( NETWORK_TYPES[NetworkType.MAINNET].validNames.includes(network)) {
      req.data.params.networkType = NetworkType.MAINNET
    } else if ( NETWORK_TYPES[NetworkType.TESTNET].validNames.includes(network)) {
      req.data.params.networkType = NetworkType.TESTNET
    } else {
      throw new Error(`the network is invalid, supported networks: ${NETWORK_TYPES.map(v=>v.name).join(',')}`)
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
    getPublicKey = async () => {
      const account = await wallet.getCurrentAccount();
      if(!account) return ''
      return account.pubkey;
    };

  @Reflect.metadata('SAFE', true)
    getInscriptions = async (req) => {
      const { data: { params: { cursor,size } } } = req;
      const account = await wallet.getCurrentAccount();
      if(!account) return ''
      const {list,total} = await wallet.openapi.getAddressInscriptions(account.address,cursor,size);
      return {list,total};
    };

  @Reflect.metadata('SAFE', true)
    getBalance = async () => {
      const account = await wallet.getCurrentAccount();
      if (!account) return null;
      const balance = await wallet.getAddressBalance(account.address)
      return {
        confirmed: amountToSaothis(balance.confirm_amount),
        unconfirmed:amountToSaothis(balance.confirm_amount),
        total:amountToSaothis(balance.amount)
      };
    };

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    const { data: { params: { toAddress, satoshis } } } = req;

  }])
    sendBitcoin = async ({approvalRes:{psbtHex}}) => {
      const psbt = Psbt.fromHex(psbtHex);
      const tx = psbt.extractTransaction();
      const rawtx = tx.toHex()
      return await wallet.pushTx(rawtx)
    }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    const { data: { params: { toAddress, satoshis } } } = req;
  }])
    sendInscription = async ({approvalRes:{psbtHex}}) => {
      const psbt = Psbt.fromHex(psbtHex);
      const tx = psbt.extractTransaction();
      const rawtx = tx.toHex()
      return await wallet.pushTx(rawtx)
    }

  @Reflect.metadata('APPROVAL', ['SignText', () => {
    // todo check text
  }])
    signMessage = async ({ data: { params: { text, type } } }) => {
      if (type === 'bip322-simple') {
        return wallet.signBIP322Simple(text)
      } else {
        return wallet.signMessage(text)
      }
    }

  // @Reflect.metadata('APPROVAL', ['SignTx', () => {
  //   // todo check
  // }])
  //   signTx = async () => {
  //     // todo
  //   }

  @Reflect.metadata('SAFE',true)
    pushTx = async ({data:{params:{rawtx}}}) => {
      return await wallet.pushTx(rawtx)
    }

  @Reflect.metadata('APPROVAL', ['SignPsbt', (req) => {
    const { data: { params: { psbtHex,options } } } = req;
    // todo
  }])
    signPsbt = async ({ data: { params: { psbtHex,options } } }) => {
      const account = await wallet.getCurrentAccount();
      if (!account) throw null;
      const networkType = wallet.getNetworkType()
      const psbtNetwork = toPsbtNetwork(networkType)
      const psbt = Psbt.fromHex(psbtHex,{network:psbtNetwork});
      await wallet.signPsbt( psbt,options);
      return psbt.toHex();
    }

  @Reflect.metadata('APPROVAL', ['MultiSignPsbt', (req) => {
    const { data: { params: { psbtHexs,options } } } = req;
    // todo
  }])
    multiSignPsbt = async ({ data: { params: { psbtHexs,options } } }) => {
      const account = await wallet.getCurrentAccount();
      if (!account) throw null;
      const networkType = wallet.getNetworkType()
      const psbtNetwork = toPsbtNetwork(networkType)
      const result: string[] = [];
      const _options: any = options || [];
      for (let i = 0; i < psbtHexs.length; i++){
        const psbt = Psbt.fromHex(psbtHexs[i],{network:psbtNetwork});
        await wallet.signPsbt(psbt,_options[i]);
        result.push(psbt.toHex())
      }
      return result;
    }


  @Reflect.metadata('SAFE', true)
    pushPsbt = async ({ data: { params: { psbtHex } } }) => {
      const psbt = Psbt.fromHex(psbtHex);
      const tx = psbt.extractTransaction();
      const rawtx = tx.toHex()
      return await wallet.pushTx(rawtx)
    }

  @Reflect.metadata('APPROVAL', ['InscribeTransfer', (req) => {
    const { data: { params: { ticker } } } = req;
    // todo
  }])
    inscribeTransfer = async ({approvalRes}) => {
      return approvalRes
    }
}

export default new ProviderController();
