import { TxType } from '@/shared/types';
import { Content, Header, Layout } from '@/ui/components';
import { useOrdinalsTx, usePushOrdinalsTxCallback } from '@/ui/state/transactions/hooks';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

export default function OrdinalsTxConfirmScreen() {
  const ordinalsTx = useOrdinalsTx();
  const navigate = useNavigate();
  const pushOrdinalsTx = usePushOrdinalsTxCallback();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Sending"
      />
      <Content>
        <SignPsbt
          params={{ data: { psbtHex: ordinalsTx.psbtHex, type: TxType.SEND_INSCRIPTION } }}
          handleCancel={() => {
            navigate('MainScreen');
          }}
          handleConfirm={() => {
            pushOrdinalsTx().then((success) => {
              if (success) {
                navigate('TxSuccessScreen');
              } else {
                navigate('TxFailScreen');
              }
            });
          }}
        />
      </Content>
    </Layout>
  );
}
