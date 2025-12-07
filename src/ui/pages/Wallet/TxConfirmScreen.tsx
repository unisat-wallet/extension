import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { useI18n, useNavigation, usePushBitcoinTxCallback } from '@unisat/wallet-state';

import { SignPsbt } from '../Approval/components';

interface LocationState {
  rawTxInfo: RawTxInfo;
}

export default function TxConfirmScreen(props) {
  const { t } = useI18n();
  const nav = useNavigation();
  const { rawTxInfo } = nav.getRouteState<LocationState>(props);
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
            nav.navigate('TxSuccessScreen', { txid });
          } else {
            throw new Error(error);
          }
        } catch (e) {
          nav.navigate('TxFailScreen', { error: (e as any).message });
        }
      }}
    />
  );
}
