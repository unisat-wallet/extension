import { useMemo } from 'react';

import { InscribeOrder, RawTxInfo, TokenBalance } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { satoshisToAmount, useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface LocationState {
  order: InscribeOrder;
  tokenBalance: TokenBalance;
  amount: number;
  feeRate: number;
  rawTxInfo: RawTxInfo;
}

export default function InscribeConfirmScreen() {
  const { order, tokenBalance, amount, rawTxInfo, feeRate } = useLocationState<LocationState>();

  const tools = useTools();
  const navigate = useNavigate();
  const pushBitcoinTx = usePushBitcoinTxCallback();

  const onClickConfirm = () => {
    tools.showLoading(true);
    pushBitcoinTx(rawTxInfo.rawtx).then(({ success, txid, error }) => {
      if (success) {
        tools.showLoading(true);
        checkResult();
      } else {
        tools.toastError(error);
      }
    });
  };

  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const checkResult = async () => {
    const result = await wallet.getInscribeResult(order.orderId);
    if (!result) {
      setTimeout(() => {
        checkResult();
      }, 2000);
      return;
    }
    wallet.getBRC20Summary(currentAccount.address, tokenBalance.ticker).then((v) => {
      navigate('BRC20SendScreen', {
        tokenBalance: v.tokenBalance,
        selectedInscriptionIds: [result.inscriptionId],
        selectedAmount: parseInt(result.amount)
      });
    });
  };

  const fee = rawTxInfo.fee || 0;
  const networkFee = useMemo(() => satoshisToAmount(fee), [fee]);
  const outputValue = useMemo(() => satoshisToAmount(order.outputValue), [order.outputValue]);
  const minerFee = useMemo(() => satoshisToAmount(order.minerFee + fee), [order.minerFee]);
  const originServiceFee = useMemo(() => satoshisToAmount(order.originServiceFee), [order.originServiceFee]);
  const serviceFee = useMemo(() => satoshisToAmount(order.serviceFee), [order.serviceFee]);
  const totalFee = useMemo(() => satoshisToAmount(order.totalFee + fee), [order.totalFee]);

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
            <Text text="Inscribe TRANSFER" preset="title-bold" textCenter mt="lg" />

            <Column justifyCenter style={{ height: 250 }}>
              <Text text={`${amount} ${tokenBalance.ticker}`} preset="title-bold" size="xxl" color="gold" textCenter />

              <Column mt="xxl">
                <Text text="Preview" preset="sub-bold" />
                <Card preset="style2">
                  <Text
                    text={`{"p":"brc-20","op":"transfer","tick":"${tokenBalance.ticker}","amt":"${amount}"}`}
                    size="xs"
                  />
                </Card>
              </Column>
            </Column>

            <Column>
              <Row justifyBetween>
                <Text text="Payment Network Fee" color="textDim" />
                <Text text={`${networkFee} BTC`} />
              </Row>

              <Row justifyBetween>
                <Text text="Inscription Output Value" color="textDim" />
                <Text text={`${outputValue} BTC`} />
              </Row>

              <Row justifyBetween>
                <Text text="Inscription Network Fee" color="textDim" />
                <Text text={`${minerFee} BTC`} />
              </Row>

              <Row justifyBetween>
                <Text text="Service Fee" color="textDim" />
                {originServiceFee != serviceFee ? (
                  <Column>
                    <Text
                      text={`${originServiceFee} BTC`}
                      style={{ textDecorationLine: 'line-through' }}
                      color="textDim"
                    />
                    <Text text={`${serviceFee} BTC`} />
                  </Column>
                ) : (
                  <Text text={`${serviceFee} BTC`} />
                )}
              </Row>
              <Row justifyBetween>
                <Text text="Total" color="gold" />
                <Text text={`${totalFee} BTC`} color="gold" />
              </Row>
            </Column>
          </Column>

          <Row>
            <Button
              text="Cancel"
              preset="default"
              full
              onClick={() => {
                window.history.go(-1);
              }}
            />
            <Button text="Pay & Inscribe" preset="primary" full onClick={onClickConfirm} />
          </Row>
        </Column>
      </Content>
      <Footer />
    </Layout>
  );
}
