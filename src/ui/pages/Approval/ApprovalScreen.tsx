import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApproval, useWallet } from '@/ui/utils';

import { ApprovalComponentParams, StandardApprovalData } from '@/shared/types/Approval';
import { ApprovalComponents } from './components';

export default function ApprovalScreen() {
    const wallet = useWallet();
    const [getApproval, , rejectApproval] = useApproval();

    const [approvalData, setApprovalData] = useState<StandardApprovalData | null>(null);

    const navigate = useNavigate();

    const init = async () => {
        const approval = (await getApproval()) as StandardApprovalData | undefined;
        if (!approval) {
            navigate('/');
            return null;
        }
        setApprovalData(approval);
        const documentTitle = approval.origin ?? approval.params.session?.origin
        if (documentTitle) {
            document.title = documentTitle;
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

    if (!approvalData) return <></>;
    const { approvalComponent, params, origin } = approvalData;
    const CurrentApprovalComponent = ApprovalComponents[approvalComponent] as React.ComponentType<{
        params: ApprovalComponentParams<typeof approvalComponent>;
        origin?: string;
    }>;    
    return <CurrentApprovalComponent params={params} origin={origin} />;
}
