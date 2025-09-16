import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function TxConfirmScreen() {
  const { t } = useI18n();
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
      handleConfirm={async (res) => {
        try {
          let txData = '';

          if (res && res.psbtHex) {
            txData = res.psbtHex;
          } else if (res && res.rawtx) {
            txData = res.rawtx;
          } else if (rawTxInfo && rawTxInfo.rawtx) {
            txData = rawTxInfo.rawtx;
          } else {
            throw new Error(t('invalid_transaction_data'));
          }

          const { success, txid, error } = await pushBitcoinTx(txData);
          if (success) {
            navigate('TxSuccessScreen', { txid });
          } else {
            throw new Error(error);
          }
        } catch (e) {
          navigate('TxFailScreen', { error: (e as any).message });
        }
      }}
    />
  );
}
