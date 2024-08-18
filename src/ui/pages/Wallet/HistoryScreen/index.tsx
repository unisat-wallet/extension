import { Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import AssetTag from '@/ui/components/AssetTag';
import { Pagination } from '@/ui/components/Pagination';
import { HistoryDetail } from '@/ui/pages/Wallet/HistoryScreen/HistoryDetail';
import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToBTC, shortAddress, useWallet } from '@/ui/utils';
import { ClockCircleFilled } from '@ant-design/icons';

interface ExtraItem {
  ticker: string;
  value: BigNumber;
  symbol: string;
  type: 'BRC20' | 'RUNES' | 'BTC';
  div: number;
}

export interface HistoryItem {
  txid: string;
  address: string;
  type: 'receive' | 'send';
  btcAmount: number;
  extra: ExtraItem[];
  confirmations: number;
  feeRate: number;
  fee: number;
  outputValue: number;
  timestamp: number;
}

interface GroupItem {
  date: string;
  historyItems: HistoryItem[];
  index: number;
}

interface MyItemProps {
  group: GroupItem;
  index: number;
  onItemClick: (value: HistoryItem) => void;
}

export function AmountItem({ item, inDetail }: { item: ExtraItem; inDetail?: boolean }) {
  const isReceived = item.value.isPositive();

  return (
    <Row gap={'sm'} style={{ flexWrap: 'wrap' }} justifyEnd={!inDetail} justifyCenter={inDetail} itemsCenter>
      {
        // item.type !== 'BTC' && <AssetTag type={item.type} small />
      }
      <Text text={isReceived ? '+' : '-'} color={isReceived ? 'green' : 'red'} />
      {item.type === 'BTC' && (
        <Text
          text={`${Number(item.value.abs().toNumber()).toLocaleString('en', { minimumFractionDigits: 8 })}`}
          ellipsis
          size={inDetail ? 'xl' : 'xs'}
        />
      )}
      {item.type === 'BRC20' && (
        <>
          <Text text={item.value.abs().toString()} ellipsis style={{ maxWidth: 200 }} size={inDetail ? 'xl' : 'xs'} />
        </>
      )}
      {item.type === 'RUNES' && (
        <>
          <Tooltip
            title={item.ticker}
            overlayStyle={{
              fontSize: fontSizes.xs
            }}>
            <Text
              text={runesUtils.toDecimalAmount(item.value.abs().toString(), item.div)}
              ellipsis
              style={{ maxWidth: 200 }}
              size={inDetail ? 'xl' : 'xs'}
            />
          </Tooltip>
        </>
      )}
      <Text
        color={'textDim'}
        text={item.symbol || item.ticker}
        ellipsis
        style={{ maxWidth: inDetail ? undefined : 200 }}
        size={inDetail ? 'md' : 'xs'}
      />
      {item.type !== 'BTC' && inDetail && <AssetTag type={item.type} />}
    </Row>
  );
}

function MyItem({ group, index, onItemClick }: MyItemProps) {
  return (
    <Column key={index} style={{ position: 'relative' }} gap={'zero'}>
      <Text
        text={group.date}
        color="textDim"
        style={{ position: 'sticky', top: 0, backgroundColor: '#070606', marginLeft: 16 }}
        py={'md'}
      />
      <Column gap={'zero'}>
        {group.historyItems.map((item, index) => {
          const isReceived = item.type === 'receive';
          return (
            <Row
              clickable
              justifyBetween
              full
              key={`item_${index}`}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 16px'
                // marginTop:
              }}
              onClick={() => {
                onItemClick(item);
              }}>
              <Row itemsCenter>
                {isReceived ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="8" fill="url(#paint0_linear_5181_4125)" fillOpacity="0.12" />
                    <path
                      d="M21.9003 23.9965C22.5086 23.9965 23 23.505 23 22.8967V15.1985C23 14.5902 22.5086 14.0988 21.9003 14.0988C21.292 14.0988 20.8005 14.5902 20.8005 15.1985V20.2402L13.879 13.3221C13.4494 12.8925 12.7518 12.8925 12.3222 13.3221C11.8926 13.7517 11.8926 14.4493 12.3222 14.8789L19.2437 21.797H14.2021C13.5938 21.797 13.1023 22.2884 13.1023 22.8967C13.1023 23.505 13.5938 23.9965 14.2021 23.9965H21.9003Z"
                      fill="#7CDB98"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_5181_4125"
                        x1="30.75"
                        y1="2.625"
                        x2="3"
                        y2="31.125"
                        gradientUnits="userSpaceOnUse">
                        <stop stopColor="#77EBCF" />
                        <stop offset="1" stopColor="#60F9C6" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="36" rx="8" fill="url(#paint0_linear_5181_4101)" fillOpacity="0.15" />
                    <path
                      d="M23.9966 13.0997C23.9966 12.4914 23.5051 12 22.8968 12L15.1986 12C14.5903 12 14.0989 12.4914 14.0989 13.0997C14.0989 13.708 14.5903 14.1995 15.1986 14.1995L20.2403 14.1995L13.3222 21.121C12.8926 21.5506 12.8926 22.2482 13.3222 22.6778C13.7518 23.1074 14.4494 23.1074 14.879 22.6778L21.7971 15.7563L21.7971 20.7979C21.7971 21.4062 22.2885 21.8977 22.8968 21.8977C23.5051 21.8977 23.9966 21.4062 23.9966 20.7979L23.9966 13.0997Z"
                      fill="#FF8474"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_5181_4101"
                        x1="30.75"
                        y1="2.625"
                        x2="3"
                        y2="31.125"
                        gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF7665" />
                        <stop offset="1" stopColor="#FFA082" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                <Column gap={'sm'}>
                  <Text text={isReceived ? 'Receive' : 'send'} />
                  <Text text={`${isReceived ? 'From' : 'To'} ${shortAddress(item.address)}`} preset="sub" />
                </Column>
              </Row>
              <Column style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <AmountItem
                  item={{
                    ticker: 'BTC',
                    value: new BigNumber(item.btcAmount),
                    type: 'BTC',
                    div: 0,
                    symbol: 'BTC'
                  }}
                />
                {item.extra.map((extraItem, index) => {
                  return <AmountItem key={index} item={extraItem} />;
                })}
              </Column>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
}

const pageSize = 20;

export default function HistoryScreen() {
  const address = useAccountAddress();
  const wallet = useWallet();
  const tools = useTools();

  const [page, setPage] = useState(1);
  const [historyGroups, setHistoryGroups] = useState<GroupItem[]>([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<HistoryItem>();

  useEffect(() => {
    if (address) {
      tools.showLoading(true);
      setHistoryGroups([]);
      wallet
        .getAddressHistory({ address, start: (page - 1) * pageSize, limit: pageSize })
        .then((res) => {
          const _historyGroups: GroupItem[] = [];
          let lastDate = '';
          let lastGroup: GroupItem;
          let index = 0;
          res.detail.forEach((v) => {
            // const date = moment(v.timestamp * 1000 || Date.now()).format('MMMM DD, YYYY');
            const date = new Date(v.timestamp * 1000).toLocaleDateString();
            if (lastDate != date) {
              lastDate = date;
              lastGroup = { date, historyItems: [], index: index++ };
              _historyGroups.push(lastGroup);
            }

            let btcAmount = new BigNumber(0);
            const assetMap: { [key: string]: ExtraItem } = {};

            let fromAddress = '';
            let toAddress = '';

            v.vin.forEach((vin) => {
              if (vin.address === address) {
                btcAmount = btcAmount.minus(vin.value);
                if (vin.brc20) {
                  vin.brc20.forEach((b) => {
                    if (!assetMap[b.ticker]) {
                      assetMap[b.ticker] = {
                        ticker: b.ticker,
                        value: new BigNumber(0),
                        type: 'BRC20',
                        symbol: '',
                        div: 0
                      };
                    }
                    assetMap[b.ticker].value = assetMap[b.ticker].value.minus(b.amount);
                  });
                }

                if (vin.runes) {
                  vin.runes.forEach((r) => {
                    if (!assetMap[r.spacedRune]) {
                      assetMap[r.spacedRune] = {
                        ticker: r.spacedRune,
                        value: new BigNumber(0),
                        type: 'RUNES',
                        symbol: r.symbol,
                        div: r.divisibility
                      };
                    }
                    assetMap[r.spacedRune].value = assetMap[r.spacedRune].value.minus(r.amount);
                  });
                }
              } else {
                fromAddress = vin.address;
              }
            });

            v.vout.forEach((vout) => {
              if (vout.address === address) {
                btcAmount = btcAmount.plus(vout.value);
                if (vout.brc20) {
                  vout.brc20.forEach((b) => {
                    if (!assetMap[b.ticker]) {
                      assetMap[b.ticker] = {
                        ticker: b.ticker,
                        value: new BigNumber(0),
                        type: 'BRC20',
                        symbol: '',
                        div: 0
                      };
                    }
                    assetMap[b.ticker].value = assetMap[b.ticker].value.plus(b.amount);
                  });
                }
                if (vout.runes) {
                  vout.runes.forEach((r) => {
                    if (!assetMap[r.spacedRune]) {
                      assetMap[r.spacedRune] = {
                        ticker: r.spacedRune,
                        value: new BigNumber(0),
                        type: 'RUNES',
                        symbol: r.symbol,
                        div: r.divisibility
                      };
                    }
                    assetMap[r.spacedRune].value = assetMap[r.spacedRune].value.plus(r.amount);
                  });
                }
              } else {
                toAddress = vout.address;
              }
            });

            const extra: ExtraItem[] = [];
            for (const assetMapKey in assetMap) {
              const item = assetMap[assetMapKey];
              extra.push(item);
            }

            lastGroup.historyItems.push({
              txid: v.txid,
              address: (btcAmount.isPositive() ? fromAddress : toAddress) || address,
              type: btcAmount.isPositive() ? 'receive' : 'send',
              btcAmount: satoshisToBTC(btcAmount.toNumber()),
              extra,
              confirmations: v.confirmations,
              feeRate: v.feeRate,
              fee: v.fee,
              outputValue: v.outputValue,
              timestamp: v.timestamp * 1000
            });
          });

          setTotal(res.total);
          setHistoryGroups(_historyGroups);
        })
        .finally(() => {
          tools.showLoading(false);
        });
    }
  }, [address, page]);

  return (
    <>
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
          <Content style={{ padding: '0 0 16px' }}>
            <Column gap={'lg'}>
              {historyGroups.map((data, index) => (
                <MyItem key={index} group={data} index={index} onItemClick={setDetail} />
              ))}
            </Column>{' '}
            <Row justifyCenter mt="lg">
              <Pagination
                pagination={{
                  currentPage: page,
                  pageSize
                }}
                total={total}
                onChange={(pagination) => {
                  setPage(pagination.currentPage);
                }}
              />
            </Row>
          </Content>
        )}
      </Layout>
      {detail && (
        <HistoryDetail
          detail={detail}
          close={() => {
            setDetail(undefined);
          }}
        />
      )}
    </>
  );
}
