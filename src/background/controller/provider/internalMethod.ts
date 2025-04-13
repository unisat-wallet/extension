import { keyringService } from '@/background/service';

import wallet from '../wallet';

const tabCheckin = ({
  data: {
    params: { name, icon }
  },
  session,
  port
}) => {
  // Get the trusted origin from the port's sender tab URL
  const trustedOrigin = port?.sender?.tab?.url ? new URL(port.sender.tab.url).origin : null;

  // If we can't verify the origin, reject the request
  if (!trustedOrigin) {
    throw new Error('Cannot verify request origin');
  }

  // Use the verified trusted origin instead of trusting client-provided values
  session.setProp({ origin: trustedOrigin, name, icon });
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
    network: wallet.getLegacyNetworkName(),
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
