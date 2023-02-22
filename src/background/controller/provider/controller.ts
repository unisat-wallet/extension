import { ethErrors } from 'eth-rpc-errors';
import { cloneDeep } from 'lodash';

import { keyringService, permissionService, preferenceService, sessionService } from '@/background/service';
import { Account } from '@/background/service/preference';

import BaseController from '../base';

class ProviderController extends BaseController {
  getCurrentAccount = async () => {
    let account = preferenceService.getCurrentAccount();
    if (account) {
      const accounts = await this.getAccounts();
      const matchAcct = accounts.find((acct) => account!.address === acct.address);
      if (!matchAcct) account = undefined;
    }

    if (!account) {
      [account] = await this.getAccounts();
      if (!account) return null;
      preferenceService.setCurrentAccount(account);
    }

    return cloneDeep(account) as Account;
  };

  getAccounts = () => {
    return keyringService.getAllVisibleAccountsArray();
  };

  ethRequestAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }

    const _account = await this.getCurrentAccount();
    const account = _account ? [_account.address.toLowerCase()] : [];
    sessionService.broadcastEvent('accountsChanged', account);
    const connectSite = permissionService.getConnectedSite(origin);
    if (connectSite) {
      sessionService.broadcastEvent(
        'networkChanged',
        {
          network: 'mainnet'
        },
        origin
      );
    }

    return account;
  };

  ethAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      return [];
    }

    const account = await this.getCurrentAccount();
    return account ? [account.address.toLowerCase()] : [];
  };
}

export default new ProviderController();
