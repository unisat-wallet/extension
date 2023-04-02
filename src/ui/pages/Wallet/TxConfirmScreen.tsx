import { TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { useBitcoinTx, usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

export default function TxConfirmScreen() {
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const pushBitcoinTx = usePushBitcoinTxCallback();
  return (
    <SignPsbt
      header=<Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      params={{ data: { psbtHex: bitcoinTx.psbtHex, type: TxType.SEND_BITCOIN } }}
      handleCancel={() => {
        navigate('MainScreen');
      }}
      handleConfirm={() => {
        pushBitcoinTx().then((success) => {
          if (success) {
            navigate('TxSuccessScreen');
          } else {
            navigate('TxFailScreen');
          }
        });
      }}
    />
  );
}
