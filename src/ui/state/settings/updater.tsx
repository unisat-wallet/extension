import { useCallback, useEffect, useRef } from 'react';

import eventBus from '@/shared/eventBus';
import { useWallet } from '@/ui/utils';

import { SessionEvent, SessionEventPayload } from '@/shared/interfaces/SessionEvent';
import { useAppDispatch } from '../hooks';
import { useChainType } from '../settings/hooks';
import { settingsActions } from '../settings/reducer';

export default function ChainUpdater() {
    const dispatch = useAppDispatch();
    const wallet = useWallet();
    const currentChainType = useChainType();

    const selfRef = useRef({
        loading: false
    });

    const self = selfRef.current;
    const reloadChainType = useCallback(async () => {
        if (self.loading) return;
        self.loading = true;

        try {
            const chainType = await wallet.getChainType();
            if (chainType !== currentChainType) {
                dispatch(settingsActions.updateSettings({ chainType }));
            }
        } catch (error) {
            console.error('Error reloading chain type:', error);
        } finally {
            self.loading = false;
        }
    }, [currentChainType, dispatch, self, wallet]);

    useEffect(() => {
        const chainChangeHandler = (newChainInfo: unknown) => {
            const params = newChainInfo as SessionEventPayload<SessionEvent.chainChanged>;
            if (!params || !params.enum) return;

            if (typeof params.enum === 'string') {
                dispatch(settingsActions.updateSettings({ chainType: params.enum }));
            }
        };

        eventBus.addEventListener('chainChanged', chainChangeHandler);
        return () => {
            eventBus.removeEventListener('chainChanged', chainChangeHandler);
        };
    }, [dispatch]);

    useEffect(() => {
        void reloadChainType();
    }, [reloadChainType]);

    return null;
}
