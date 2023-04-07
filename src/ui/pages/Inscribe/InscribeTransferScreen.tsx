import { useEffect, useState } from 'react';

import { TokenBalance } from '@/shared/types';
import { Button, Column, Content, Footer, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCreateBitcoinTxCallback, useFetchUtxosCallback } from '@/ui/state/transactions/hooks';
import { useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface LocationState {
  tokenBalance: TokenBalance;
}

export default function InscribeTransferScreen() {
  const { tokenBalance } = useLocationState<LocationState>();

  const wallet = useWallet();
  const account = useCurrentAccount();
  const [feeRate, setFeeRate] = useState(5);
  const navigate = useNavigate();
  const [inputAmount, setInputAmount] = useState('');

  const tools = useTools();
  const createBitcoinTx = useCreateBitcoinTxCallback();

  const fetchUtxos = useFetchUtxosCallback();

  const [inputError, setInputError] = useState('');

  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    setInputError('');
    setDisabled(true);

    const amount = parseInt(inputAmount);
    if (amount > parseInt(tokenBalance.availableBalance)) {
      setInputError('Insufficient Balance');
      return;
    }

    setDisabled(false);
  }, [inputAmount]);

  useEffect(() => {
    fetchUtxos();
  }, []);

  const onClickInscribe = async () => {
    try {
      tools.showLoading(true);
      const amount = parseInt(inputAmount);
      const order = await wallet.inscribeBRC20Transfer(
        account.address,
        tokenBalance.ticker,
        amount.toString(),
        feeRate
      );
      const rawTxInfo = await createBitcoinTx({ address: order.payAddress, domain: '' }, order.totalFee, feeRate);

      navigate('InscribeConfirmScreen', { order, amount, tokenBalance, rawTxInfo });
    } catch (e) {
      console.log(e);
      tools.toastError((e as Error).message);
    } finally {
      tools.showLoading(false);
    }
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Column full>
          <Column gap="lg" full>
            <Text text="Inscribe TRANSFER" preset="title-bold" textCenter my="lg" />

            <Column>
              <Row justifyBetween>
                <Text text="Available" color="textDim" />
                <Text
                  text={`${tokenBalance.availableBalance} ${tokenBalance.ticker}`}
                  onClick={() => {
                    setInputAmount(tokenBalance.availableBalance);
                  }}
                />
              </Row>

              <Input
                preset="amount"
                placeholder={'Amount'}
                value={inputAmount}
                autoFocus={true}
                onChange={async (e) => {
                  setInputAmount(e.target.value);
                }}
              />
              {inputError && <Text text={inputError} color="error" />}
            </Column>

            <Column>
              <Text text="Fee Rate" color="textDim" />
              <FeeRateBar
                onChange={(val) => {
                  setFeeRate(val);
                }}
              />
            </Column>
          </Column>

          <Button text="Inscribe TRANSFER" preset="primary" onClick={onClickInscribe} disabled={disabled} />
        </Column>
      </Content>
      <Footer />
    </Layout>
  );
}
