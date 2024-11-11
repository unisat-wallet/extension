import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { isWalletError } from '@/shared/utils/errors';
import { SignPsbt } from '../Approval/components';
import { RouteTypes, useNavigate } from '../MainRoute';

interface LocationState {
    rawTxInfo: RawTxInfo;
}

export default function TxConfirmScreen() {
    const { rawTxInfo } = useLocationState<LocationState>();
    const navigate = useNavigate();
    const pushBitcoinTx = usePushBitcoinTxCallback();
    return (
        <SignPsbt
            header={
                <Header
                    onBack={() => {
                        window.history.go(-1);
                    }}
                />
            }
            params={{ data: { psbtHex: rawTxInfo.psbtHex, type: TxType.SEND_BITCOIN, rawTxInfo } }}
            handleCancel={() => {
                window.history.go(-1);
            }}
            handleConfirm={(res) => {
                pushBitcoinTx((res ?? rawTxInfo).rawtx)
                    .then(({ success, txid, error }) => {
                        if (success) {
                            navigate(RouteTypes.TxSuccessScreen, { txid });
                        } else {
                            navigate(RouteTypes.TxFailScreen, { error });
                        }
                    })
                    .catch((err: unknown) => {
                        console.error(err);
                        const errorMessage = isWalletError(err) ? err.message : 'Unknown error occurred';
                        navigate(RouteTypes.TxFailScreen, { error: errorMessage });
                    });
            }}
        />
    );
}
