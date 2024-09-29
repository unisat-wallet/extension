import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressCAT20UtxoSummary, CAT20Balance } from '@/shared/types';
import { Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';

export function NoMergeLayout({
  cat20Balance,
  tokenUtxoSummary
}: {
  cat20Balance: CAT20Balance;
  tokenUtxoSummary: AddressCAT20UtxoSummary;
}) {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Merge UTXOs for CAT20 Asset"
      />
      <Content>
        <Column>
          <Row itemsCenter fullX justifyCenter>
            <Text
              text={`${runesUtils.toDecimalAmount(cat20Balance.amount, cat20Balance.decimals)}`}
              preset="bold"
              textCenter
              size="xxl"
              wrap
              digital
            />
            <BRC20Ticker tick={cat20Balance.symbol} preset="lg" />
          </Row>

          <Row justifyCenter>
            <Text
              text={`${tokenUtxoSummary.totalUtxoCount} UTXOs`}
              preset="bold"
              color="orange"
              textCenter
              size="md"
              wrap
            />
          </Row>

          <Column
            style={{
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#F4B62C59',
              backgroundColor: 'rgba(244, 182, 44, 0.08)'
            }}>
            <Column mx="md" my="md">
              <Text text={'You need at least 2 UTXOs to merge'} size="xs" color="warning_content" />
            </Column>
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
