import { keyringService } from '@/background/service';

import { SessionInfo } from '@/background/service/session';
import { ProviderState } from '@/shared/types/Provider';
import { ProviderControllerRequest } from '@/shared/types/Request';
import wallet from '../wallet';

const tabCheckin = ({
    data: {
        params: { origin, name, icon }
    },
    session
}: ProviderControllerRequest & { data: { params: SessionInfo } }) => {
    session.setProp({ origin, name, icon });
};

const getProviderState = async (_req: ProviderControllerRequest): Promise<ProviderState> => {
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
        chain: wallet.getChainType(),
        isUnlocked,
        accounts
    };
};

const keepAlive = (_req: ProviderControllerRequest) => {
    return 'ACK_KEEP_ALIVE_MESSAGE';
};

export default {
    tabCheckin,
    getProviderState,
    keepAlive
};
