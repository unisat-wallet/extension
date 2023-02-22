import { keyringService, permissionService } from '@/background/service';
import { CHAINS } from '@/shared/constant';

import providerController from './controller';

const tabCheckin = ({
  data: {
    params: { origin, name, icon }
  },
  session
}) => {
  session.setProp({ origin, name, icon });
};

const getProviderState = async (req) => {
  const {
    session: { origin }
  } = req;

  const chainEnum = permissionService.getWithoutUpdate(origin)?.chain;
  const isUnlocked = keyringService.memStore.getState().isUnlocked;

  return {
    isUnlocked,
    accounts: isUnlocked ? await providerController.ethAccounts(req) : [],
    network: CHAINS[chainEnum].network
  };
};

export default {
  tabCheckin,
  getProviderState
};
