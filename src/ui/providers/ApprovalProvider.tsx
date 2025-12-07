import { ApprovalContext, ApprovalContextType, useNavigation, useWallet } from '@unisat/wallet-state';
import { useEffect, useRef } from 'react';
import { getUiType } from '../web';

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const nav = useNavigation();

  const getApproval = wallet.getApproval;
  const resolveApproval = async (data?: any, stay = false, forceReject = false) => {
    const approval = await wallet.getApproval();

    if (approval) {
      await wallet.resolveApproval(data, forceReject);
    }
    if (stay) {
      return;
    }
    setTimeout(() => {
      nav.navigate('/');
    });
  };

  const rejectApproval = async (reason?: string, stay = false, isInternal = false) => {
    const approval = await wallet.getApproval();
    if (approval) {
      await wallet.rejectApproval(reason, stay, isInternal);
    }
    if (!stay) {
      nav.navigate('/');
    }
  };
  const selfRef = useRef<ApprovalContextType>({
    getApproval,
    resolveApproval,
    rejectApproval
  });

  useEffect(() => {
    if (!getUiType().isNotification) {
      return;
    }
    window.addEventListener('beforeunload', rejectApproval as any);

    return () => window.removeEventListener('beforeunload', rejectApproval as any);
  }, []);

  const self = selfRef.current;

  return <ApprovalContext.Provider value={self}>{children}</ApprovalContext.Provider>;
}
