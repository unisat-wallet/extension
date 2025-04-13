import { RawTxInfo, TxType } from '@/shared/types';
import { Header } from '@/ui/components';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

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
      handleConfirm={async (res) => {
        try {
          let rawtx = '';

          if (res && res.psbtHex) {
            const psbt = bitcoin.Psbt.fromHex(res.psbtHex);
            try {
              psbt.finalizeAllInputs();
            } catch (e) {
              // ignore
            }
            rawtx = psbt.extractTransaction().toHex();
          } else if (res && res.rawtx) {
            rawtx = res.rawtx;
          } else if (rawTxInfo && rawTxInfo.rawtx) {
            rawtx = rawTxInfo.rawtx;
          } else {
            throw new Error('Invalid transaction data');
          }

          const { success, txid, error } = await pushBitcoinTx(rawtx);
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
