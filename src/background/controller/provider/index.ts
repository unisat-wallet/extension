
import { keyringService, sessionService } from '@/background/service';
import { tab } from '@/background/webapi';

import { providerErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { ProviderControllerRequest } from '@/shared/types/Request';
import internalMethod from './internalMethod';
import rpcFlow from './rpcFlow';


tab.on('tabRemove', (id) => {
    sessionService.deleteSession(id);
});

export default (req: ProviderControllerRequest): Promise<unknown> => {
    const method = req.data.method;

    // @ts-expect-error
    if (internalMethod[method]) {
        // @ts-expect-error
        return internalMethod[method](req);
    }

    const hasVault = keyringService.hasVault();
    if (!hasVault) {
        throw providerErrors.userRejectedRequest({
            message: 'wallet must has at least one account'
        });
    }

    return rpcFlow(req);
};
