import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { usePushAtomicalsTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function SignAtomicalsTransactionScreen() {
  const { rawTxInfo } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const pushAtomicalsTx = usePushAtomicalsTxCallback();
  return (
    <SignPsbt
      header=<Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      params={{
        data: {
          psbtHex: rawTxInfo.psbtHex,
          type: TxType.SEND_ATOMICALS_INSCRIPTION,
          rawTxInfo,
          options: { autoFinalized: false }
        }
      }}
      handleCancel={() => {
        navigate('MainScreen');
      }}
      handleConfirm={() => {
        pushAtomicalsTx(rawTxInfo.rawtx).then(({ success, txid, error }) => {
          if (success) {
            navigate('TxSuccessScreen', { txid });
          } else {
            navigate('TxFailScreen', { error });
          }
        });
      }}
    />
  );
}
