import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo, TokenBalance, TokenInfo, TxType, UserToSignInput } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useRunesTx } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { isValidAddress, showLongNumber, useWallet } from '@/ui/utils';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { SignPsbt } from '../Approval/components';

export default function BRC20SingleStepScreen() {
  const { state } = useLocation();
  const props = state as {
    tokenBalance: TokenBalance;
    tokenInfo: TokenInfo;
  };

  const { t } = useI18n();

  const tokenBalance = props.tokenBalance;
  const tokenInfo = props.tokenInfo;

  const navigate = useNavigate();
  const runesTx = useRunesTx();
  const [inputAmount, setInputAmount] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: runesTx.toAddress,
    domain: runesTx.toDomain,
    inscription: undefined
  });

  const [availableBalance, setAvailableBalance] = useState(tokenBalance.overallBalance);
  const [error, setError] = useState('');

  const defaultOutputValue = 546;

  const currentAccount = useCurrentAccount();
  const [outputValue, setOutputValue] = useState(defaultOutputValue);
  const minOutputValue = useMemo(() => {
    if (toInfo.address) {
      const dust1 = getAddressUtxoDust(currentAccount.address);
      const dust2 = getAddressUtxoDust(toInfo.address);
      return Math.max(dust1, dust2);
    } else {
      return 0;
    }
  }, [toInfo.address, currentAccount.address]);

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);

  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }
    if (!inputAmount) {
      return;
    }

    if (feeRate <= 0) {
      return;
    }

    setDisabled(false);
  }, [toInfo, inputAmount, feeRate, enableRBF, outputValue, minOutputValue]);

  const tools = useTools();

  const wallet = useWallet();
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
      const step1 = await wallet.singleStepTransferBRC20Step1({
        userAddress: currentAccount.address,
        userPubkey: currentAccount.pubkey,
        receiver: toInfo.address,
        ticker: tokenBalance.ticker,
        amount: inputAmount,
        feeRate
      });
      if (step1) {
        transferData.current.id = step1.orderId;
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
            const step2 = await wallet.singleStepTransferBRC20Step2({
              orderId: transferData.current.id,
              commitTx: transferData.current.commitTx,
              toSignInputs: transferData.current.commitToSignInputs
            });

            transferData.current.revealTx = step2.psbtHex;
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
            const step3 = await wallet.singleStepTransferBRC20Step3({
              orderId: transferData.current.id,
              revealTx: transferData.current.revealTx,
              toSignInputs: transferData.current.revealToSignInputs
            });
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
        title={t('send')}
      />
      <Content>
        <Row justifyCenter>
          <Text
            text={`${showLongNumber(tokenBalance.overallBalance)} ${tokenBalance.ticker}`}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
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
          <Row justifyBetween>
            <Text text={t('balance')} color="textDim" />
            <TickUsdWithoutPrice tick={tokenBalance.ticker} balance={inputAmount} type={TokenType.BRC20} />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(availableBalance);
              }}>
              <Text text={t('max')} preset="sub" style={{ color: colors.white_muted }} />
              <Text text={`${showLongNumber(availableBalance)} ${tokenBalance.ticker}`} preset="bold" size="sm" wrap />
            </Row>
          </Row>

          <Input
            preset="amount"
            placeholder={t('amount')}
            value={inputAmount.toString()}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            runesDecimal={tokenInfo.decimal}
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
