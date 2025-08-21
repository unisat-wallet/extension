import { useEffect, useRef, useState } from 'react';

import { CAT721CollectionInfo, CAT_VERSION, Inscription, TxType, UserToSignInput } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import CAT721Preview from '@/ui/components/CAT721Preview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { MergeBTCPopover } from '@/ui/components/MergeBTCPopover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useRunesTx } from '@/ui/state/transactions/hooks';
import { isValidAddress, useLocationState, useWallet } from '@/ui/utils';
import { getAddressType } from '@unisat/wallet-bitcoin';
import { AddressType } from '@unisat/wallet-types';

import { SignPsbt } from '../Approval/components';

interface LocationState {
  version: CAT_VERSION;
  collectionInfo: CAT721CollectionInfo;
  localId: string;
}

export default function SendCAT721Screen() {
  const { version, localId, collectionInfo } = useLocationState<LocationState>();

  const wallet = useWallet();
  const { t } = useI18n();

  const navigate = useNavigate();
  const runesTx = useRunesTx();
  const [inputAmount, setInputAmount] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: runesTx.toAddress,
    domain: runesTx.toDomain,
    inscription: undefined
  });

  const [error, setError] = useState('');

  const networkType = useNetworkType();

  const [showMergeBTCUTXOPopover, setShowMergeBTCUTXOPopover] = useState(false);
  const tools = useTools();

  const [feeRate, setFeeRate] = useState(5);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    const addressType = getAddressType(toInfo.address, networkType);
    if (addressType !== AddressType.P2TR && addressType !== AddressType.P2WPKH) {
      setError(t('the_recipient_must_be_p2tr_or_p2wpkh_address_type'));
      return;
    }

    setDisabled(false);
  }, [toInfo, inputAmount]);

  const transferData = useRef<{
    id: string;
    commitTx: string;
    commitToSignInputs: UserToSignInput[];
    revealTx: string;
    revealToSignInputs: UserToSignInput[];
  }>({
    id: '',
    commitTx: '',
    commitToSignInputs: [],
    revealTx: '',
    revealToSignInputs: []
  });
  const [step, setStep] = useState(0);
  const onConfirm = async () => {
    tools.showLoading(true);
    try {
      const step1 = await wallet.transferCAT721Step1(
        version,
        toInfo.address,
        collectionInfo.collectionId,
        localId,
        feeRate
      );
      if (step1) {
        transferData.current.id = step1.id;
        transferData.current.commitTx = step1.commitTx;
        transferData.current.commitToSignInputs = step1.toSignInputs;
        setStep(1);
      }
    } catch (e) {
      const msg = (e as any).message;
      if (msg.includes('-307')) {
        setShowMergeBTCUTXOPopover(true);
        return;
      }
      setError((e as any).message);
    } finally {
      tools.showLoading(false);
    }
  };

  if (step == 1) {
    return (
      <SignPsbt
        header=<Header
          title={t('step_12')}
          onBack={() => {
            setStep(0);
          }}
        />
        params={{
          data: {
            psbtHex: transferData.current.commitTx,
            type: TxType.SIGN_TX,
            options: { autoFinalized: false, toSignInputs: transferData.current.commitToSignInputs }
          }
        }}
        handleCancel={() => {
          setStep(0);
        }}
        handleConfirm={async () => {
          try {
            tools.showLoading(true);
            const step2 = await wallet.transferCAT721Step2(
              version,
              transferData.current.id,
              transferData.current.commitTx,
              transferData.current.commitToSignInputs
            );

            transferData.current.revealTx = step2.revealTx;
            transferData.current.revealToSignInputs = step2.toSignInputs;

            setStep(1.5);
            setTimeout(() => {
              setStep(2);
            }, 100);
          } catch (e) {
            console.log(e);
          } finally {
            tools.showLoading(false);
          }
        }}
      />
    );
  } else if (step == 1.5) {
    return <Loading />;
  } else if (step == 2) {
    return (
      <SignPsbt
        header=<Header
          title={t('step_22')}
          onBack={() => {
            setStep(0);
          }}
        />
        params={{
          data: {
            psbtHex: transferData.current.revealTx,
            type: TxType.SIGN_TX,
            options: { autoFinalized: false, toSignInputs: transferData.current.revealToSignInputs }
          }
        }}
        handleCancel={() => {
          setStep(0);
        }}
        handleConfirm={async () => {
          tools.showLoading(true);
          try {
            const step3 = await wallet.transferCAT721Step3(
              version,
              transferData.current.id,
              transferData.current.revealTx,
              transferData.current.revealToSignInputs
            );
            navigate('TxSuccessScreen', { txid: step3.txid });
          } catch (e) {
            // tools.toastError((e as any).message);
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
        title={t('send_cat721')}
      />
      <Content>
        <Text text={collectionInfo.name} preset="title-bold" textCenter size="xxl" color="gold" />

        <Row justifyCenter>
          <CAT721Preview
            version={version}
            preset="medium"
            collectionId={collectionInfo.collectionId}
            contentType={collectionInfo.contentType}
            localId={localId}
          />
        </Row>

        <Column mt="lg">
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            autoFocus={true}
            recipientLabel={<Text text={t('recipient')} preset="regular" color="textDim" />}
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

        {showMergeBTCUTXOPopover && (
          <MergeBTCPopover
            onClose={() => {
              setShowMergeBTCUTXOPopover(false);
            }}
          />
        )}
      </Content>
    </Layout>
  );
}
