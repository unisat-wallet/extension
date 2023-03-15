import { keyringService } from '@/background/service';

import wallet from '../wallet';

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
  const accounts: string[] = [];
  if (isUnlocked) {
    const currentAccount = await wallet.getCurrentAccount();
    if (currentAccount) {
      accounts.push(currentAccount.address);
    }
  }
  return {
    network: wallet.getNetworkName(),
    isUnlocked,
    accounts
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
