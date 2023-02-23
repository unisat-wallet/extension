import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import moment from 'moment';
import { forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
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
      <div className="flex flex-col items-center gap-2_5 mb-2_5">
        <span className="text-2xl font-semibold text-white">{'Latest Transactions'}</span>
        <div className="flex items-center text-lg text-white duration-80 opacity-60 hover:opacity-100">
          <img src="./images/eye.svg" alt="" />
          <a
            className="text-white cursor-pointer hover:text-white"
            href={`${blockstreamUrl}/address/${address}`}
            target="_blank"
            rel="noreferrer">
            &nbsp;{'View on Block Explorer'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div key={index} className="mt-2_5">
      <div className="pl-2 font-semibold text-soft-white">{group.date}</div>
      {group.historyItems.map((item, index) => {
        const isReceived = item.amount > 0;
        return (
          <div className="mt-2_5" key={`item_${index}`}>
            <div className="justify-between box nobor " key={index}>
              <div className="flex flex-col">
                <span>Transfer</span>
                <span className="text-soft-white">
                  {isReceived ? 'From' : 'To'} {shortAddress(item.address)}
                </span>
              </div>
              <span>
                <span className={`font-semibold ${isReceived ? 'text-custom-green' : 'text-warn'}`}>
                  {isReceived ? '+' : '-'}
                </span>
                <span className="font-semibold text-white">
                  {Number(Math.abs(item.amount)).toLocaleString('en', { minimumFractionDigits: 8 })}
                </span>{' '}
                {item.symbol}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const ForwardMyItem = forwardRef(MyItem);
  // const html = document.getElementsByTagName('html')[0];
  // let virtualListHeight = 485;
  // if (html && getComputedStyle(html).fontSize) {
  //   virtualListHeight = (virtualListHeight * parseFloat(getComputedStyle(html).fontSize)) / 16;
  // }

  const accountHistory = useHistory();
  const fetchHistory = useFetchHistoryCallback();

  useEffect(() => {
    fetchHistory();
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
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
        <div className="flex flex-col items-strech h-full gap-5 justify-evenly mt-5 mx-5">
          <div className={'flex-1  min-h-[200px] w-full p-2 '} style={{}}>
            {historyGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 font-semibold text-soft-white">
                <ClockCircleFilled className="text-2xl font-semibold text-soft-white" />
                {t('This account has no transactions')}
              </div>
            ) : (
              <>
                {historyGroups.map((data, index) => (
                  <MyItem key={index} group={data} index={index} />
                ))}
              </>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
