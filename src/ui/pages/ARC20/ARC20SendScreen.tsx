import { Checkbox } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { RawTxInfo, TokenBalance, TokenTransfer, TransferFtConfigInterface, TxType } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { TabBar } from '@/ui/components/TabBar';
import { useAccountAddress, useAccountBalance, useAtomicals, useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  useBitcoinTx,
  useCreateARC20TxCallback,
  useCreateMultiOrdinalsTxCallback,
  usePushOrdinalsTxCallback
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { isValidAddress, satoshisToAmount, useWallet } from '@/ui/utils';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';
import { IAtomicalBalanceItem, ISelectedUtxo } from '@/background/service/interfaces/api';
import { DUST_AMOUNT } from '@/shared/constant';
import { use } from 'i18next';

enum TabKey {
  STEP1,
  STEP2,
  STEP3
}

interface ContextData {
  tabKey: TabKey;
  tokenBalance: IAtomicalBalanceItem;
  transferAmount: number;
  transferableList: TokenTransfer[];
  inscriptionIdSet: Set<string>;
  feeRate: number;
  receiver: string;
  rawTxInfo: RawTxInfo;
}

interface UpdateContextDataParams {
  tabKey?: TabKey;
  transferAmount?: number;
  transferableList?: TokenTransfer[];
  inscriptionIdSet?: Set<string>;
  feeRate?: number;
  receiver?: string;
  rawTxInfo?: RawTxInfo;
}

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const accountBalance = useAccountBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const [disabled, setDisabled] = useState(true);
  const [inputAmount, setInputAmount] = useState(
    bitcoinTx.toSatoshis > 0 ? satoshisToAmount(bitcoinTx.toSatoshis) : ''
  );
  const [feeRate, setFeeRate] = useState(5);
  const [error, setError] = useState('');
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
  }>({
    address: bitcoinTx.toAddress,
    domain: bitcoinTx.toDomain
  });
  const fromAddress = useAccountAddress();
  // const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  const createARC20Tx = useCreateARC20TxCallback();
  const atomicals = useAtomicals();
  console.log('atomicals', atomicals);
  const relatedAtomUtxos = atomicals.atomicals_utxos
    ? atomicals.atomicals_utxos.filter((o) => o.atomicals[0] === contextData.tokenBalance.atomical_id)
    : [];

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }

    if (!inputAmount) {
      return;
    }
    setDisabled(false);
  }, [toInfo, inputAmount, feeRate]);

  const {
    error: outputError,
    utxos,
    outputs,
    remaining_utxos,
    remaining,
    remaining_min,
    totalAmount
  } = useMemo(() => {
    const currentOutputValue = Number(inputAmount);
    if (currentOutputValue < DUST_AMOUNT) {
      return { error: `Amount must be at least ${DUST_AMOUNT} BTC` };
    }
    const sorted = Array.from(relatedAtomUtxos).sort((a, b) => b.value - a.value);
    console.log('sorted', sorted);
    const outputs = [
      {
        value: currentOutputValue as number,
        address: toInfo.address
      }
    ];
    let _selectedValue = 0;
    const _selectedUtxos: ISelectedUtxo[] = [];
    let _break_i: number | undefined = undefined;
    for (let i = 0; i < sorted.length; i++) {
      _selectedValue += sorted[i].value;
      _selectedUtxos.push(sorted[i]);
      if (_selectedValue === currentOutputValue || _selectedValue >= currentOutputValue + DUST_AMOUNT) {
        _break_i = i;
        break;
      }
    }

    const _remaining_utxos: ISelectedUtxo[] = [];
    let _remaining_balances = 0;
    if (_break_i !== undefined) {
      for (let i = _break_i + 1; i < sorted.length; i += 1) {
        _remaining_utxos.push(sorted[i]);
        _remaining_balances += sorted[i].value;
      }
    }

    let remaining_min: number | undefined;
    const diff = _selectedValue - currentOutputValue;
    if (diff === 0) {
      remaining_min = 0;
    } else if (diff >= 2 * DUST_AMOUNT) {
      remaining_min = diff - DUST_AMOUNT;
    } else if (diff >= DUST_AMOUNT && diff < 2 * DUST_AMOUNT) {
      remaining_min = diff;
    } else {
      remaining_min = undefined;
    }
    let finalTokenOutputs: { value: number; address: string; ticker: string; change: boolean }[] = [];
    const changeAmount = _selectedValue - (currentOutputValue ?? 0);

    finalTokenOutputs = outputs.map((f) => {
      return { value: f.value, address: fromAddress!, ticker: contextData.tokenBalance.ticker, change: false };
    });
    if (changeAmount > 0) {
      finalTokenOutputs.push({
        value: changeAmount,
        address: fromAddress,
        ticker: contextData.tokenBalance.ticker,
        change: true
      });
    }
    finalTokenOutputs = [...finalTokenOutputs];

    return {
      error: '',
      outputs: finalTokenOutputs,
      atomicalsId: contextData.tokenBalance.atomical_id,
      confirmed: contextData.tokenBalance.confirmed,
      totalAmount: currentOutputValue || 0,
      utxos: _selectedUtxos.length > 0 ? _selectedUtxos : [],
      remaining: _remaining_balances,
      remaining_min,
      remaining_utxos: _remaining_utxos
    };
  }, [contextData.tokenBalance, inputAmount, feeRate]);

  console.log('input', outputError, utxos, remaining_utxos, remaining, remaining_min, totalAmount);
  const onClickNext = () => {
    const obj: TransferFtConfigInterface = {
      atomicalsInfo: {
        confirmed: contextData?.tokenBalance.confirmed,
        type: contextData?.tokenBalance?.type,
        utxos: relatedAtomUtxos
      },
      selectedUtxos: utxos ?? [],
      outputs: outputs ?? [],
    };
    const rawTxInfo = createARC20Tx(obj, toInfo, atomicals.nonAtomUtxos, 20, false);
    navigate('TxConfirmScreen', { rawTxInfo });
  };

  return (
    <Content mt="lg">
      <Column full>
        <Column gap="lg" full>
          <Column>
            <Text text={'BTC Balance'} color="textDim" />
            <Text text={`${accountBalance.amount} BTC`} size="xxl" textCenter my="lg" />
          </Column>

          {/* <Column>
            <TransferableList contextData={contextData} updateContextData={updateContextData} />
          </Column> */}

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
            <Input
              preset="amount"
              placeholder={'Amount'}
              defaultValue={inputAmount}
              value={inputAmount}
              onChange={async (e) => {
                // if (autoAdjust == true) {
                //   setAutoAdjust(false);
                // }
                setInputAmount(e.target.value);
              }}
            />
          </Column>
          <Row justifyBetween>
            <Text text={`${contextData.tokenBalance.ticker} Balance`} color="textDim" />
            <Text
              text={`${contextData.tokenBalance.confirmed} ${contextData.tokenBalance.ticker}`}
              preset="bold"
              size="sm"
            />
          </Row>
          <Column>
            <Text text="Fee Rate" color="textDim" />
            <FeeRateBar
              onChange={(val) => {
                setFeeRate(val);
              }}
            />
          </Column>
        </Column>

        <Button text="Next" preset="primary" onClick={onClickNext} disabled={disabled} />
      </Column>
    </Content>
  );
}

const ARC20SendScreen = () => {
  const { state } = useLocation();
  const props = state as {
    tokenBalance: IAtomicalBalanceItem;
    selectedInscriptionIds: string[];
    selectedAmount: number;
  };

  const tokenBalance = props.tokenBalance;
  const selectedInscriptionIds = props.selectedInscriptionIds || [];
  const selectedAmount = props.selectedAmount || 0;

  const [contextData, setContextData] = useState<ContextData>({
    tabKey: TabKey.STEP1,
    tokenBalance,
    transferAmount: selectedAmount,
    transferableList: [],
    inscriptionIdSet: new Set(selectedInscriptionIds),
    feeRate: 5,
    receiver: '',
    rawTxInfo: {
      psbtHex: '',
      rawtx: ''
    }
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const component = useMemo(() => {
    if (contextData.tabKey === TabKey.STEP1) {
      return <Step1 contextData={contextData} updateContextData={updateContextData} />;
    }
    // else if (contextData.tabKey === TabKey.STEP2) {
    //   return <Step2 contextData={contextData} updateContextData={updateContextData} />;
    // } else {
    //   return <Step3 contextData={contextData} updateContextData={updateContextData} />;
    // }
  }, [contextData]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Send ARC20"
      />
      <Row mt="lg" />
      {component}
    </Layout>
  );
};

export default ARC20SendScreen;
