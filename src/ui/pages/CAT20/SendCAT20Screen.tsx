import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import {
  AddressCAT20UtxoSummary,
  CAT20Balance,
  CAT20TokenInfo,
  Inscription,
  TxType,
  UserToSignInput
} from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { MergeBTCPopover } from '@/ui/components/MergeBTCPopover';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useRunesTx } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { isValidAddress, showLongNumber, useWallet } from '@/ui/utils';
import { AddressType } from '@unisat/wallet-sdk';
import { getAddressType } from '@unisat/wallet-sdk/lib/address';

import { SignPsbt } from '../Approval/components';

const MAX_TOKEN_INPUT = 4;

export default function SendCAT20Screen() {
  const { state } = useLocation();
  const props = state as {
    cat20Balance: CAT20Balance;
    cat20Info: CAT20TokenInfo;
  };

  const cat20Balance = props.cat20Balance;

  const cat20Info = props.cat20Info;

  const wallet = useWallet();

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

  const [tokenUtxoSummary, setTokenUtxoSummary] = useState<AddressCAT20UtxoSummary>({
    totalUtxoCount: 0,
    availableUtxoCount: 0,
    availableTokenAmounts: []
  });
  const [error, setError] = useState('');

  const account = useCurrentAccount();

  const networkType = useNetworkType();

  const [showMergeBTCUTXOPopover, setShowMergeBTCUTXOPopover] = useState(false);
  const tools = useTools();

  useEffect(() => {
    tools.showLoading(true);
    wallet
      .getAddressCAT20UtxoSummary(account.address, cat20Balance.tokenId)
      .then((data) => {
        setTokenUtxoSummary(data);
      })
      .finally(() => {
        tools.showLoading(false);
      });
  }, []);

  const availableTokenAmount = useMemo(() => {
    let amount = new BigNumber(0);
    for (let i = 0; i < Math.min(tokenUtxoSummary.availableTokenAmounts.length, MAX_TOKEN_INPUT); i++) {
      amount = amount.plus(BigNumber(tokenUtxoSummary.availableTokenAmounts[i]));
    }
    return amount.toString();
  }, [tokenUtxoSummary]);

  const shouldShowMerge = availableTokenAmount !== cat20Balance.amount;

  const [feeRate, setFeeRate] = useState(5);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    const addressType = getAddressType(toInfo.address, networkType);
    if (addressType !== AddressType.P2TR && addressType !== AddressType.P2WPKH) {
      setError('The recipient must be P2TR or P2WPKH address type');
      return;
    }

    if (!inputAmount) {
      return;
    }

    const amt = runesUtils.fromDecimalAmount(inputAmount, cat20Balance.decimals);
    if (runesUtils.compareAmount(amt, '0') != 1) {
      return;
    }

    if (runesUtils.compareAmount(amt, availableTokenAmount) == 1) {
      // insufficient balance
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
      const cat20Amount = runesUtils.fromDecimalAmount(inputAmount, cat20Balance.decimals);
      const step1 = await wallet.transferCAT20Step1(toInfo.address, cat20Balance.tokenId, cat20Amount, feeRate);
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
          title="STEP 1/2"
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
            const step2 = await wallet.transferCAT20Step2(
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
          title="STEP 2/2"
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
            const step3 = await wallet.transferCAT20Step3(
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
        title="Send CAT20"
      />
      <Content>
        <Text text={cat20Info.name} preset="title-bold" textCenter size="xxl" color="gold" />
        <Row itemsCenter fullX justifyCenter>
          <Text
            text={`${runesUtils.toDecimalAmount(cat20Balance.amount, cat20Balance.decimals)}`}
            preset="bold"
            textCenter
            size="xxl"
            wrap
            digital
          />
          <BRC20Ticker tick={cat20Info.symbol} preset="lg" />
        </Row>

        <Row justifyCenter fullX>
          <TickUsdWithoutPrice
            tick={cat20Info.tokenId}
            balance={runesUtils.toDecimalAmount(cat20Balance.amount, cat20Balance.decimals)}
            type={TokenType.CAT20}
            size={'md'}
          />
        </Row>

        <Column mt="lg">
          <Text text="Recipient" preset="regular" color="textDim" />
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Balance" color="textDim" />
            <TickUsdWithoutPrice tick={cat20Info.tokenId} balance={inputAmount} type={TokenType.CAT20} />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(runesUtils.toDecimalAmount(availableTokenAmount, cat20Balance.decimals));
              }}>
              <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
              <Text
                text={`${showLongNumber(runesUtils.toDecimalAmount(availableTokenAmount, cat20Balance.decimals))}`}
                preset="bold"
                size="sm"
                wrap
              />
              <BRC20Ticker tick={cat20Info.symbol} preset="sm" />
            </Row>
          </Row>
          <Input
            preset="amount"
            placeholder={'Amount'}
            value={inputAmount.toString()}
            runesDecimal={cat20Balance.decimals}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
          />

          {shouldShowMerge && (
            <Column style={{ borderWidth: 1, borderRadius: 10, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Column mx="md" my="md">
                <Text
                  text={'To send a larger amount, please merge your UTXOs to increase the available balance.'}
                  size="xs"
                  color="textDim"
                />

                <Text
                  text={'Merge UTXOs->'}
                  size="xs"
                  color="gold"
                  onClick={() => {
                    navigate('MergeCAT20Screen', {
                      cat20Balance: cat20Balance,
                      cat20Info: cat20Info
                    });
                  }}
                />
              </Column>
            </Column>
          )}
        </Column>

        <Column mt="lg">
          <Text text="Fee" color="textDim" />

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
          text="Next"
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
