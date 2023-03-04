
import { permissionService, sessionService } from '@/background/service';
import { CHAINS } from '@/shared/constant';

import BaseController from '../base';
import wallet from '../wallet';
import { publicKeyToAddress } from '@/background/utils/tx-utils';



class ProviderController extends BaseController {

  connect = async ({ session: { origin } }) => {
    console.log('hasPermiss',origin,permissionService.hasPermission(origin))
    if (!permissionService.hasPermission(origin)) {
      // throw ethErrors.provider.unauthorized();
    }

    const _account = await this.getCurrentAccount();
    const account = _account ? [_account.address.toLowerCase()] : [];
    sessionService.broadcastEvent('accountsChanged', account);
    const connectSite = permissionService.getConnectedSite(origin);
    if (connectSite) {
      const chain = CHAINS[connectSite.chain];
      sessionService.broadcastEvent(
        'chainChanged',
        {
          networkVersion: chain.network
        },
        origin
      );
    }
    return _account
  };

  @Reflect.metadata('SAFE', true)
    getNetwork = async () => {
      const network = wallet.getNetworkType()
      return network;
    };

  @Reflect.metadata('SAFE', true)
    getAddress = async () => {
      const account = await wallet.getCurrentAccount();
      if(!account) return ''
      const addressType = wallet.getAddressType();
      const networkType = wallet.getNetworkType()
      const address = publicKeyToAddress(account.address,addressType,networkType)
      return address;
    };

  @Reflect.metadata('SAFE', true)
    getPublicKey = async () => {
      const account = await wallet.getCurrentAccount();
      if(!account) return ''
      return account.address;
    };

  @Reflect.metadata('SAFE', true)
    getBalance = async () => {
      const account = await this.getCurrentAccount();
      if (!account) return null;
      const balance = await wallet.getAddressBalance(account.address)
      return balance;
    };

  @Reflect.metadata('APPROVAL', ['SendBitcoin', () => {
    // todo check
  }])
    sendBitcoin = async () => {
      // todo
    }

  @Reflect.metadata('APPROVAL', ['SendInscription', () => {
    // todo check
  }])
    sendInscription = async () => {
      // todo
    }

  @Reflect.metadata('APPROVAL', ['SignText', () => {
    // todo check
  }])
    signText = async () => {
      // todo
    }

  @Reflect.metadata('APPROVAL', ['SignTx', () => {
    // ttodo check
  }])
    signTx = async () => {
      const account = await this.getCurrentAccount();
      console.log(account,'go')
    }

  @Reflect.metadata('SAFE',true)
    pushTx = async () => {
      // todo
    }

  @Reflect.metadata('APPROVAL', ['SignPsbt', () => {
    // todo check
  }])
    signPsbt = async () => {
      // todo
    }

  @Reflect.metadata('SAFE', true)
    pushPsbt = async () => {
      // todo
    }
}

export default new ProviderController();
