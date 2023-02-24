import { useEffect } from 'react';

import { getUiType, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function BoostScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;

    const isBooted = await wallet.isBooted();
    const hasVault = await wallet.hasVault();
    const isUnlocked = await wallet.isUnlocked();
    if (!isBooted) {
      navigate('WelcomeScreen');
      return;
    }

    if (!isUnlocked) {
      navigate('UnlockScreen');
      return;
    }

    if (!hasVault) {
      navigate('WelcomeScreen');
      return;
    }

    if ((await wallet.getPreMnemonics()) && !isInNotification && !isInTab) {
      navigate('CreateMnemonicsScreen');
      return;
    }

    const currentAccount = await wallet.getCurrentAccount();

    if (!currentAccount) {
      navigate('WelcomeScreen');
      return;
    } else {
      navigate('MainScreen');
      return;
    }
  };

  const init = async () => {
    const ready = await wallet.isReady();

    if (ready) {
      loadView();
    } else {
      setTimeout(() => {
        init();
      }, 1000);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return <div></div>;
}
