import { getContract, IWBTCContract, WBTC_ABI } from 'opnet';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Account, Inscription, OpNetBalance, RawTxInfo } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { wBTC } from '@btc-vision/transaction';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { useNavigate } from '../MainRoute';

interface ItemData {
  key: string;
  account?: Account;
}
export default function UnWrapBitcoinOpnet() {
  const { state } = useLocation();
  const props = state as {
    OpNetBalance: OpNetBalance;
  };

  const OpNetBalance = props.OpNetBalance;
  const account = useCurrentAccount();
  const wallet = useWallet();
  const navigate = useNavigate();
  const [inputAmount, setInputAmount] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [OpnetRateInputVal, adjustFeeRateInput] = useState('800');
  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: '',
    domain: '',
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

  const tools = useTools();
  useEffect(() => {
    const checkAvailableBalance = async () => {
      Web3API.setNetwork(await wallet.getChainType());

      const contract: IWBTCContract = getContract<IWBTCContract>(
        wBTC.getAddress(Web3API.network),
        WBTC_ABI,
        Web3API.provider,
        account.address
      );
      const checkWithdrawalRequest = await contract.withdrawableBalanceOf(account.address);

      if ('error' in checkWithdrawalRequest) {
        tools.toastError('Error getting WBTC');
        throw new Error('Invalid calldata in withdrawal request');
      }
      console.log(checkWithdrawalRequest.decoded[0]);
      const result = 10 ** OpNetBalance.divisibility;
      setAvailableBalance((Number(checkWithdrawalRequest.decoded[0] as bigint) / result).toString());
      tools.showLoading(false);
    };
    checkAvailableBalance();
  }, []);

  //const prepareSendRunes = usePrepareSendRunesCallback();

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
        title={'UnWrap Bitcoin'}
      />
      <Content>
        <Row itemsCenter fullX justifyCenter>
          {OpNetBalance.logo && <Image src={OpNetBalance.logo} size={fontSizes.tiny} />}
          <Text
            text={`${runesUtils.toDecimalAmount(OpNetBalance.amount.toString(), OpNetBalance.divisibility)} ${
              OpNetBalance.symbol
            } `}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
        </Row>
        <Column mt="lg">
          <Row justifyBetween>
            <Text text="Amount" color="textDim" />
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
          <Row justifyBetween>
            <Text text="Pending Withdrawal" color="textDim" />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(runesUtils.toDecimalAmount(OpNetBalance.amount.toString(), OpNetBalance.divisibility));
              }}>
              <Text
                text={`${runesUtils.toDecimalAmount(availableBalance.toString(), OpNetBalance.divisibility)} `}
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
                priorityFee: BigInt(OpnetRateInputVal), // replace with actual OpnetRateInputVal
                header: 'Unwrap bitcoin', // replace with actual header
                networkFee: feeRate, // replace with actual networkFee
                features: {
                  rbf: false // replace with actual rbf value
                },
                inputInfos: [], // replace with actual inputInfos
                isToSign: false, // replace with actual isToSign value
                opneTokens: [
                  {
                    amount: parseFloat(inputAmount) * 10 ** OpNetBalance.divisibility,
                    divisibility: OpNetBalance.divisibility,
                    spacedRune: OpNetBalance.name,
                    symbol: OpNetBalance.symbol
                  }
                ],
                action: 'unwrap' // replace with actual opneTokens
              }
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
