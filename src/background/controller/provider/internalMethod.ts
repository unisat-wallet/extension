import { keyringService } from '@/background/service';

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
    network: 'mainnet',
    isUnlocked,
    accounts: isUnlocked ? await providerController.getAddress() : [],
    networkVersion: ''
  };
};

export default {
  tabCheckin,
  getProviderState
};
