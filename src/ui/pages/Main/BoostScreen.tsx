import { useEffect } from 'react';

import { getUiType, useApproval, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function BoostScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();

  const [getApproval, , rejectApproval] = useApproval();
  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;
    const isInSidePanel = UIType.isSidePanel;
    const isInPopup = UIType.isPop;

    if (isInPopup) {
      try {
        await wallet.setOpenInSidePanel(false);
      } catch (error) {
        console.error('Failed to update side panel preference:', error);
      }
    }

    let approval = await getApproval();
    if (isInNotification && !approval) {
      window.close();
      return;
    }

    if (!isInNotification) {
      await rejectApproval();
      approval = undefined;
    }

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

    if (!isInNotification && !isInTab && !isInSidePanel) {
      navigate('CreateHDWalletScreen', { isImport: false });
      return;
    }

    const currentAccount = await wallet.getCurrentAccount();

    if (!currentAccount) {
      navigate('WelcomeScreen');
      return;
    } else if (approval) {
      navigate('ApprovalScreen');
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
