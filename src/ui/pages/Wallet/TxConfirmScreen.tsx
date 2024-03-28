import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { KEYRING_TYPE } from '@/shared/constant';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function TxConfirmScreen() {
  const { rawTxInfo } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const pushBitcoinTx = usePushBitcoinTxCallback();
  const account = useCurrentAccount();
  return (
    <SignPsbt
      header=<Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      params={{ data: { psbtHex: rawTxInfo.psbtHex, type: TxType.SEND_BITCOIN, rawTxInfo } }}
      handleCancel={() => {
        window.history.go(-1);
      }}
      handleConfirm={() => {
        if (account.type === KEYRING_TYPE.KeystoneKeyring) {
          navigate('KeystoneSignScreen', { type: 'psbt', data: rawTxInfo.psbtHex });
          return
        }
        pushBitcoinTx(rawTxInfo.rawtx).then(({ success, txid, error }) => {
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
