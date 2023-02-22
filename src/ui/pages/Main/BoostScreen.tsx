import { useEffect } from 'react';

import { useAppDispatch } from '@/ui/state/hooks';
import { getUiType, useApproval, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function BoostScreen() {
  const navigate = useNavigate();
  const wallet = useWallet();
  // eslint-disable-next-line prefer-const
  let [getApproval, , rejectApproval] = useApproval();
  const dispatch = useAppDispatch();
  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;
    let approval = await getApproval();

    if (isInNotification && !approval) {
      window.close();
      return;
    }

    if (!isInNotification) {
      // chrome.window.windowFocusChange won't fire when
      // click popup in the meanwhile notification is present
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

    if ((await wallet.hasPageStateCache()) && !isInNotification && !isInTab) {
      const cache = await wallet.getPageStateCache()!;
      navigate(cache.path as any);
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
    } else if (approval) {
      // todo
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
