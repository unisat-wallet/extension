import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApproval, useWallet } from '@/ui/utils';

import * as ApprovalComponent from './components';

export default function ApprovalScreen() {
  const wallet = useWallet();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const [approval, setApproval] = useState<any>(null);

  const navigate = useNavigate();

  const init = async () => {
    const approval = await getApproval();
    if (!approval) {
      navigate('/');
      return null;
    }
    setApproval(approval);
    if (approval.origin || approval.params.origin) {
      document.title = approval.origin || approval.params.origin;
    }
    const account = await wallet.getCurrentAccount();
    if (!account) {
      rejectApproval();
      return;
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (!approval) return <></>;
  const { approvalComponent, params, origin, requestDefer } = approval;
  const CurrentApprovalComponent = ApprovalComponent[approvalComponent];
  return <CurrentApprovalComponent params={params} origin={origin} requestDefer={requestDefer} />;
}
