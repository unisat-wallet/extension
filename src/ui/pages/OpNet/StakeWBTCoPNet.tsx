import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Account, Inscription, RawTxInfo, opNetBalance } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import {
  useFetchAssetUtxosRunesCallback,
  useFetchUtxosCallback,
  usePrepareSendRunesCallback,
  useRunesTx
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { useNavigate } from '../MainRoute';

interface ItemData {
  key: string;
  account?: Account;
}
export default function UnWrapBitcoinOpnet() {
  const { state } = useLocation();
  const props = state as {
    OpNetBalance: opNetBalance;
  };

  const OpNetBalance = props.OpNetBalance;
  const account = useCurrentAccount();

  const navigate = useNavigate();
  const runesTx = useRunesTx();
  const [inputAmount, setInputAmount] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [OpnetRateInputVal, adjustFeeRateInput] = useState('800');
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: runesTx.toAddress,
    domain: runesTx.toDomain,
    inscription: undefined
  });

  const [availableBalance, setAvailableBalance] = useState('0');
  const [error, setError] = useState('');

  const defaultOutputValue = 546;

  const [outputValue, setOutputValue] = useState(defaultOutputValue);
  const minOutputValue = useMemo(() => {
    if (toInfo.address) {
      return getAddressUtxoDust(toInfo.address);
    } else {
      return 0;
    }
  }, [toInfo.address]);

  const fetchUtxos = useFetchUtxosCallback();

  const fetchAssetUtxosRunes = useFetchAssetUtxosRunesCallback();
  const tools = useTools();
  useEffect(() => {
    fetchUtxos();
    setAvailableBalance((parseInt(OpNetBalance.amount.toString()) / 10 ** OpNetBalance.divisibility).toString());
    tools.showLoading(false);
  }, []);

  const prepareSendRunes = usePrepareSendRunesCallback();

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  const keyring = useCurrentKeyring();
  const items = useMemo(() => {
    const _items: ItemData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
  }, []);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!inputAmount) {
      return;
    }

    // if (outputValue < minOutputValue) {
    //   setError(`OutputValue must be at least ${minOutputValue}`);
    //   return;
    // }

    // if (!outputValue) {
    //   return;
    // }

    if (inputAmount != '') {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }
  }, [inputAmount, feeRate, enableRBF]);
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={'Stake Bitcoin'}
      />
      <Content>
        <Row justifyCenter>
          <Text
            text={`${runesUtils.toDecimalAmount(OpNetBalance.amount.toString(), OpNetBalance.divisibility)} `}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
        </Row>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Choose how much WBTC you'd like to stake" color="textDim" />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(runesUtils.toDecimalAmount(OpNetBalance.amount.toString(), OpNetBalance.divisibility));
              }}>
              <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
              <Text
                text={`${runesUtils.toDecimalAmount(OpNetBalance.amount.toString(), OpNetBalance.divisibility)} `}
                preset="bold"
                size="sm"
                wrap
              />
            </Row>
          </Row>
          <Input
            preset="amount"
            placeholder={'Amount'}
            value={inputAmount.toString()}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            runesDecimal={OpNetBalance.divisibility}
          />
        </Column>

        {toInfo.address ? (
          <Column mt="lg">
            <Text text="OutputValue" color="textDim" />

            <OutputValueBar
              defaultValue={defaultOutputValue}
              minValue={minOutputValue}
              onChange={(val) => {
                setOutputValue(val);
              }}
            />
          </Column>
        ) : null}

        <Column mt="lg">
          <Text text="Fee" color="textDim" />

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />
        </Column>
        <Text text="Opnet Fee" color="textDim" />
        <Input
          preset="amount"
          placeholder={'sat/vB'}
          value={OpnetRateInputVal}
          onAmountInputChange={(amount) => {
            adjustFeeRateInput(amount);
          }}
          // onBlur={() => {
          //   const val = parseInt(feeRateInputVal) + '';
          //   setFeeRateInputVal(val);
          // }}
          autoFocus={true}
        />
        <Column mt="lg">
          <RBFBar
            onChange={(val) => {
              setEnableRBF(val);
            }}
          />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text="Next"
          onClick={(e) => {
            navigate('TxOpnetConfirmScreen', {
              rawTxInfo: {
                items: items,
                account: account, // replace with actual account
                inputAmount: inputAmount, // replace with actual inputAmount
                address: toInfo.address, // replace with actual address
                feeRate: feeRate, // replace with actual feeRate
                OpnetRateInputVal: OpnetRateInputVal, // replace with actual OpnetRateInputVal
                header: 'Stake WBTC', // replace with actual header
                networkFee: feeRate, // replace with actual networkFee
                features: {
                  rbf: false // replace with actual rbf value
                },
                inputInfos: [], // replace with actual inputInfos
                isToSign: false, // replace with actual isToSign value
                opneTokens: [
                  {
                    amount: parseInt(inputAmount) * 10 ** OpNetBalance.divisibility,
                    divisibility: OpNetBalance.divisibility,
                    spacedRune: OpNetBalance.name,
                    symbol: OpNetBalance.symbol
                  }
                ],
                action: 'stake' // replace with actual opneTokens
              }
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
