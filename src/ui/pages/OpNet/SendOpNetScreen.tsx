import { networks } from 'bitcoinjs-lib';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Account, Inscription, RawTxInfo, opNetBalance } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import {
  useFetchAssetUtxosRunesCallback,
  useFetchUtxosCallback,
  usePrepareSendRunesCallback,
  useRunesTx
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { isValidAddress, useWallet } from '@/ui/utils';
import { ABICoder, BinaryWriter } from '@btc-vision/bsi-binary';
import { FetchUTXOParams, OPNetLimitedProvider, TransactionFactory, UTXO, Wallet } from '@btc-vision/transaction';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

interface ItemData {
  key: string;
  account?: Account;
}
export default function SendOpNetScreen() {
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
    tools.showLoading(false);
  }, []);

  const prepareSendRunes = usePrepareSendRunesCallback();

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
  const wallet = useWallet();
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
  const getData = async (wallet: any) => {
    const foundObject = items.find((obj) => obj.account && obj.account.address === account.address);

    console.log(foundObject?.account);
    const wifWallet = await wallet.getPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, networks.regtest);
    const opnetNode: string = 'https://regtest.opnet.org';

    const utxoManager = new OPNetLimitedProvider('https://regtest.opnet.org');
    const factory: TransactionFactory = new TransactionFactory(); // Transaction factory
    const abiCoder: ABICoder = new ABICoder();
    const transferSelector = Number(`0x` + abiCoder.encodeSelector('transfer'));

    console.log(walletGet);
    function getTransferToCalldata(to: string, amount: bigint): Buffer {
      const addCalldata: BinaryWriter = new BinaryWriter();
      addCalldata.writeSelector(transferSelector);
      addCalldata.writeAddress(to);
      addCalldata.writeU256(amount);
      return Buffer.from(addCalldata.getBuffer());
    }
    const utxoSetting: FetchUTXOParams = {
      address: walletGet.p2wpkh,
      minAmount: 10000n,
      requestedAmount: 100000n
    };

    const utxos: UTXO[] = await utxoManager.fetchUTXO(utxoSetting);
    console.log(utxos);
  };

  getData(wallet);

  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }
    if (!inputAmount) {
      return;
    }

    const runeAmount = runesUtils.fromDecimalAmount(inputAmount, OpNetBalance.divisibility);
    if (feeRate <= 0) {
      return;
    }

    let dustUtxo = 546;
    try {
      dustUtxo = getAddressUtxoDust(toInfo.address);
    } catch (e) {
      // console.log(e);
    }

    const minOutputValue = dustUtxo;

    if (outputValue < minOutputValue) {
      setError(`OutputValue must be at least ${minOutputValue}`);
      return;
    }

    if (!outputValue) {
      return;
    }

    if (
      toInfo.address == runesTx.toAddress &&
      runeAmount == runesTx.runeAmount &&
      feeRate == runesTx.feeRate &&
      outputValue == runesTx.outputValue &&
      enableRBF == runesTx.enableRBF
    ) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }
  }, [toInfo, inputAmount, feeRate, enableRBF, outputValue]);
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={'Send ' + OpNetBalance.name}
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
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(runesUtils.toDecimalAmount(availableBalance, OpNetBalance.divisibility));
              }}>
              <Text text="MAX" preset="sub" style={{ color: colors.white_muted }} />
              <Text
                text={`${runesUtils.toDecimalAmount(availableBalance, OpNetBalance.divisibility)} `}
                preset="bold"
                size="sm"
                wrap
              />
            </Row>
          </Row>
          <Input
            preset="amount"
            placeholder={'Amount'}
            defaultValue={inputAmount.toString()}
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
            navigate('TxConfirmScreen', { rawTxInfo });
          }}></Button>
      </Content>
    </Layout>
  );
}
