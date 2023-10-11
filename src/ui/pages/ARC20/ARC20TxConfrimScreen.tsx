import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { usePushOrdinalsTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function ARC20TxConfirmScreen() {
  const { rawTxInfo } = useLocationState<LocationState>();
  const navigate = useNavigate();
  // const pushOrdinalsTx = usePushOrdinalsTxCallback();
  return (
    <SignPsbt
      header={
        <Header
          title="Confirm Transaction"
          onBack={() => {
            window.history.go(-1);
          }}
        />
      }
      params={{ data: { psbtHex: rawTxInfo.psbtHex, type: TxType.SIGN_TX, rawTxInfo } } as any}
      handleCancel={() => {
        navigate('MainScreen');
      }}
      handleConfirm={() => {
        // pushOrdinalsTx(rawTxInfo.rawtx).then(({ success, txid, error }) => {
        //   if (success) {
        //     // navigate('TxSuccessScreen', { txid });
        //   } else {
        //     // navigate('TxFailScreen', { error });
        //   }
        // });
      }}
    />
  );
}
