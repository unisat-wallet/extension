import moment from 'moment';
import { useEffect } from 'react';

import { Layout, Content, Icon, Header, Text, Row, Column, Card } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useAccountAddress, useFetchHistoryCallback, useHistory } from '@/ui/state/accounts/hooks';
import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { shortAddress } from '@/ui/utils';
import { ClockCircleFilled } from '@ant-design/icons';

interface HistoryItem {
  address: string;
  amount: number;
  symbol: string;
}

interface GroupItem {
  date: string;
  historyItems: HistoryItem[];
  index: number;
}

interface MyItemProps {
  group: GroupItem;
  index: number;
}

const MyItem: React.ForwardRefRenderFunction<any, MyItemProps> = ({ group, index }, ref) => {
  const address = useAccountAddress();
  const blockstreamUrl = useBlockstreamUrl();
  if (group.index == -1) {
    return (
      <Column>
        <Text text="Latest Transactions" preset="title-bold" textCenter />
        <Row
          justifyCenter
          onClick={() => {
            window.open(`${blockstreamUrl}/address/${address}`);
          }}>
          <Icon icon="eye" color="textDim" />
          <Text preset="regular-bold" text="View on Block Explorer" color="textDim" />
        </Row>
      </Column>
    );
  }

  return (
    <Column key={index} mt="lg">
      <Text text={group.date} color="textDim" />
      {group.historyItems.map((item, index) => {
        const isReceived = item.amount > 0;
        return (
          <Card key={`item_${index}`}>
            <Row justifyBetween full>
              <Column selfItemsCenter>
                <Text text="Transfer" />
                <Text text={`${isReceived ? 'From' : 'To'} ${shortAddress(item.address)}`} preset="sub" />
              </Column>
              <Row selfItemsCenter>
                <Text text={isReceived ? '+' : '-'} color={isReceived ? 'green' : 'red'} />
                <Text
                  text={`${Number(Math.abs(item.amount)).toLocaleString('en', { minimumFractionDigits: 8 })} ${
                    item.symbol
                  }`}
                  preset="regular-bold"
                />
              </Row>
            </Row>
          </Card>
        );
      })}
    </Column>
  );
};

export default function HistoryScreen() {
  const accountHistory = useHistory();
  const fetchHistory = useFetchHistoryCallback();

  const tools = useTools();

  useEffect(() => {
    if (accountHistory.list.length == 0) {
      tools.showLoading(true);
    }
    fetchHistory().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const _historyGroups: GroupItem[] = [];
  let lastDate = '';
  let lastGroup: GroupItem;
  let index = 0;
  accountHistory.list.forEach((v) => {
    const date = moment(v.time * 1000 || Date.now()).format('MMMM DD, YYYY');
    if (lastDate != date) {
      lastDate = date;
      lastGroup = { date, historyItems: [], index: index++ };
      _historyGroups.push(lastGroup);
    }
    const amount = parseFloat(v.amount);
    const symbol = v.symbol;
    const address = v.address;
    lastGroup.historyItems.push({
      address,
      amount,
      symbol
    });
  });
  const historyGroups = _historyGroups;
  if (historyGroups.length == 0) {
    // virtualListHeight = 0;
  } else {
    historyGroups.unshift({
      date: '',
      historyItems: [],
      index: -1
    });
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="History"
      />

      {historyGroups.length === 0 ? (
        <Content preset="middle">
          <Column gap="lg">
            <Row justifyCenter>
              <Icon color="textDim">
                <ClockCircleFilled />
              </Icon>
            </Row>
            <Text text="This account has no transactions" color="textDim" textCenter />
          </Column>
        </Content>
      ) : (
        <Content>
          <Column>
            {historyGroups.map((data, index) => (
              <MyItem key={index} group={data} index={index} />
            ))}
          </Column>{' '}
        </Content>
      )}
    </Layout>
  );
}
