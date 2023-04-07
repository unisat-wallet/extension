import { useMemo } from 'react';

import { InscribeOrder, RawTxInfo, TokenBalance } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { satoshisToAmount, useLocationState } from '@/ui/utils';

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
    pushBitcoinTx(rawTxInfo.rawtx)
      .then(({ success, txid, error }) => {
        if (success) {
          navigate('BRC20SendScreen', { tokenBalance });
        } else {
          tools.toastError(error);
        }
      })
      .finally(() => {
        tools.showLoading(false);
      });
  };

  const outputValue = useMemo(() => satoshisToAmount(order.outputValue), [order.outputValue]);
  const minerFee = useMemo(() => satoshisToAmount(order.minerFee), [order.minerFee]);
  const serviceFee = useMemo(() => satoshisToAmount(order.serviceFee), [order.serviceFee]);
  const totalFee = useMemo(() => satoshisToAmount(order.totalFee), [order.totalFee]);

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
                <Text text="Inscription Output Value" color="textDim" />
                <Text text={`${outputValue} BTC`} />
              </Row>
              <Row justifyBetween>
                <Text text="Network Fee" color="textDim" />
                <Text text={`${minerFee} BTC`} />
              </Row>
              <Row justifyBetween>
                <Text text="Service Fee" color="textDim" />
                <Text text={`${serviceFee} BTC`} />
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
