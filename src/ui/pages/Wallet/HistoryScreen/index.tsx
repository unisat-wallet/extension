import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import moment from 'moment';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useEffect } from 'react';
import { TFunction, useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useAccountAddress, useFetchHistoryCallback, useHistory } from '@/ui/state/accounts/hooks';
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
  t: TFunction<'translation', undefined>;
}

const MyItem: React.ForwardRefRenderFunction<any, MyItemProps> = ({ group, index, t }, ref) => {
  const address = useAccountAddress();
  if (group.index == -1) {
    return (
      <div className="flex flex-col items-center gap-2_5 mb-2_5">
        <span className="text-2xl font-semibold text-white">{t('Latest Transactions')}</span>
        <div className="flex items-center text-lg text-white duration-80 opacity-60 hover:opacity-100">
          <img src="./images/eye.svg" alt="" />
          <a
            className="text-white cursor-pointer hover:text-white"
            href={`https://blockstream.info/address/${address}`}
            target="_blank"
            rel="noreferrer">
            &nbsp;{t('View on Block Explorer')}
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
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech h-full gap-5 justify-evenly mt-5 mx-5">
          <div className="grid flex-grow gap-2_5">
            {historyGroups.length == 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 font-semibold text-soft-white">
                <ClockCircleFilled className="text-2xl font-semibold text-soft-white" />
                {t('This account has no transactions')}
              </div>
            ) : null}

            <VirtualList
              data={historyGroups}
              data-id="list"
              // height={virtualListHeight}
              itemHeight={20}
              itemKey={(group) => group.date}
              // disabled={animating}
              style={{
                boxSizing: 'border-box'
              }}

              // onSkipRender={onAppear}
              // onItemRemove={onAppear}
            >
              {(item, index) => <ForwardMyItem group={item} index={index} t={t} />}
            </VirtualList>
          </div>
        </div>
      </Content>
      <FooterBackButton />
    </Layout>
  );
}
