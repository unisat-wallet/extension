import { keyringService } from '@/background/service';

import wallet from '../wallet';
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

  const isUnlocked = keyringService.memStore.getState().isUnlocked;

  return {
    network: wallet.getNetworkName(),
    isUnlocked,
    accounts: isUnlocked ? [await providerController.getAddress()] : []
  };
};

const keepAlive = () => {
  return 'ACK_KEEP_ALIVE_MESSAGE';
};

export default {
  tabCheckin,
  getProviderState,
  keepAlive
};
