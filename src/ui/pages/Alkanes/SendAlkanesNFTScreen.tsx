import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AlkanesInfo, Inscription, TxType, UserToSignInput } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { isValidAddress, useWallet } from '@/ui/utils';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';

import { SignPsbt } from '../Approval/components';

enum Step {
  CREATE_TX = 0,
  SIGN_TX = 1
}

export default function SendAlkanesNFTScreen() {
  const { state } = useLocation();
  const props = state as {
    alkanesInfo: AlkanesInfo;
  };
  const { t } = useI18n();

  const alkanesInfo = props.alkanesInfo;

  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(true);
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: '',
    domain: '',
    inscription: undefined
  });

  const [error, setError] = useState('');

  const currentAccount = useCurrentAccount();

  const tools = useTools();

  const [feeRate, setFeeRate] = useState(5);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    if (feeRate <= 0) {
      return;
    }

    setDisabled(false);
  }, [toInfo, feeRate]);

  const transferData = useRef<{
    id: string;
    commitTx: string;
    commitToSignInputs: UserToSignInput[];
  }>({
    id: '',
    commitTx: '',
    commitToSignInputs: []
  });

  const [step, setStep] = useState(0);

  const wallet = useWallet();

  const pushBitcoinTx = usePushBitcoinTxCallback();

  const onConfirm = async () => {
    tools.showLoading(true);
    try {
      const step1 = await wallet.createAlkanesSendTx({
        userAddress: currentAccount.address,
        userPubkey: currentAccount.pubkey,
        receiver: toInfo.address,
        alkaneid: alkanesInfo.alkaneid,
        amount: '1',
        feeRate
      });
      if (step1) {
        transferData.current.commitTx = step1.psbtHex;
        transferData.current.commitToSignInputs = step1.toSignInputs;
        setStep(1);
      }
    } catch (e) {
      const msg = (e as any).message;
      setError((e as any).message);
    } finally {
      tools.showLoading(false);
    }
  };

  if (step == 1) {
    return (
      <SignPsbt
        header={
          <Header
            onBack={() => {
              setStep(0);
            }}
          />
        }
        params={{
          data: {
            psbtHex: transferData.current.commitTx,
            type: TxType.SIGN_TX,
            options: { autoFinalized: true, toSignInputs: transferData.current.commitToSignInputs }
          }
        }}
        handleCancel={() => {
          setStep(0);
        }}
        handleConfirm={async (res) => {
          tools.showLoading(true);
          try {
            if (res && res.psbtHex) {
              let rawtx = '';
              const psbt = bitcoin.Psbt.fromHex(res.psbtHex);
              try {
                psbt.finalizeAllInputs();
              } catch (e) {
                // ignore
              }
              rawtx = psbt.extractTransaction().toHex();

              const { success, txid, error } = await pushBitcoinTx(rawtx);
              if (success) {
                navigate('TxSuccessScreen', { txid });
              } else {
                throw new Error(error);
              }
              return;
            }

            const step3 = await wallet.signAlkanesSendTx({
              commitTx: transferData.current.commitTx,
              toSignInputs: transferData.current.commitToSignInputs as any
            });
            navigate('TxSuccessScreen', { txid: step3.txid });
          } catch (e) {
            navigate('TxFailScreen', { error: (e as any).message });
          } finally {
            tools.showLoading(false);
          }
        }}
      />
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('send_alkanes')}
      />
      <Content>
        <Row justifyCenter>
          <AlkanesNFTPreview alkanesInfo={alkanesInfo} preset="medium" />
        </Row>

        <Column mt="lg">
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            recipientLabel={<Text text={t('recipient')} preset="regular" color="textDim" />}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Text text={t('fee')} color="textDim" />

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text={t('next')}
          onClick={(e) => {
            onConfirm();
          }}></Button>
      </Content>
    </Layout>
  );
}
