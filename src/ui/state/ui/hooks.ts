import { AppState } from '..';
import { useAppDispatch, useAppSelector } from '../hooks';
import { uiActions } from './reducer';

export function useUIState(): AppState['ui'] {
    return useAppSelector((state) => state.ui);
}

export function useAssetTabKey() {
    const uiState = useUIState();
    return uiState.assetTabKey;
}

export function useUiTxCreateScreen() {
    const uiState = useUIState();
    return uiState.uiTxCreateScreen;
}

export function useUpdateUiTxCreateScreen() {
    const dispatch = useAppDispatch();
    return ({
        toInfo,
        inputAmount,
        enableRBF,
        feeRate
    }: {
        toInfo?: { address: string; domain: string };
        inputAmount?: string;
        enableRBF?: boolean;
        feeRate?: number;
    }) => {
        dispatch(uiActions.updateTxCreateScreen({ toInfo, inputAmount, enableRBF, feeRate }));
    };
}

export function useResetUiTxCreateScreen() {
    const dispatch = useAppDispatch();
    return () => {
        dispatch(uiActions.resetTxCreateScreen());
    };
}
