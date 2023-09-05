import { List } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ORC20_ATM_ADDRESS, ORC_CASH_ATM_ADDRESS } from '@/shared/constant';
import { AddressTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text, Grid } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { Empty } from '@/ui/components/Empty';
import { IconTypes } from '@/ui/components/Icon';
import { TabBar } from '@/ui/components/TabBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { formatNumber, useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface LocationState {
  ticker: string;
  inscriptionNumber: string;
  protocol: 'orc-20' | 'orc-cash';
}

export default function ORC20TokenScreen() {
  const { ticker, inscriptionNumber, protocol } = useLocationState<LocationState>();

  const [tokenSummary, setTokenSummary] = useState<AddressTokenSummary>({
    tokenBalance: {
      ticker,
      overallBalance: '',
      availableBalance: '',
      transferableBalance: '',
      availableBalanceSafe: '',
      availableBalanceUnSafe: ''
    },
    tokenInfo: {
      totalSupply: '',
      totalMinted: ''
    },
    historyList: [],
    transferableList: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();
  useEffect(() => {
    wallet.getORC20Summary(account.address, inscriptionNumber.toString(), protocol).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
    });
  }, []);

  const balance = useMemo(() => {
    if (!tokenSummary) {
      return '--';
    }
    return tokenSummary?.tokenBalance.overallBalance;
  }, [tokenSummary]);

  const [tabKey, setTabKey] = useState('cash');

  const outOfMint = tokenSummary.tokenInfo.totalMinted == tokenSummary.tokenInfo.totalSupply;
  const shouldShowSafe = tokenSummary.tokenBalance.availableBalanceSafe !== tokenSummary.tokenBalance.availableBalance;

  const tabItems = [
    {
      key: 'cash',
      label: 'Cash',
      children: (
        <CashContent
          protocol={protocol}
          outOfMint={outOfMint}
          inscriptionNumber={inscriptionNumber}
          tokenSummary={tokenSummary}
          ticker={ticker}
        />
      )
    },
    {
      key: 'credit',
      label: 'Credit',
      children: <CreditContent />
    }
    // {
    //   key: 'vote',
    //   label: 'Vote',
    //   children: <VoteContent />
    // }
  ];

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      {tokenSummary && (
        <Content>
          <Column py="xl" style={{ borderBottomWidth: 1, borderColor: colors.white_muted }}>
            <Text text={`${formatNumber(balance)} ${ticker}`} preset="bold" textCenter size="xxl" />
            <Row justifyBetween>
              <Text text="Credit" preset="bold" size="lg" />

              {shouldShowSafe ? (
                <Column>
                  <Row gap="zero">
                    <Text
                      text={`${formatNumber(tokenSummary.tokenBalance.availableBalance)} ${ticker}`}
                      preset="bold"
                      size="lg"
                    />
                  </Row>
                </Column>
              ) : (
                <Text text={`${tokenSummary.tokenBalance.availableBalance} ${ticker}`} preset="bold" size="lg" />
              )}
            </Row>
            <Row justifyBetween>
              <Text text="Cash" preset="bold" size="lg" />
              <Text
                text={`${formatNumber(tokenSummary.tokenBalance.transferableBalance)} ${ticker}`}
                preset="bold"
                size="lg"
              />
            </Row>
          </Column>

          <Row justifyBetween>
            <TabBar
              defaultActiveKey={tabKey}
              activeKey={tabKey}
              items={tabItems}
              onTabClick={(key) => {
                setTabKey(key);
                // dispatch(uiActions.updateWalletTabScreen({ tabKey: key }));
              }}
            />
          </Row>

          {tabItems.find((item) => item.key === tabKey)?.children}
        </Content>
      )}
    </Layout>
  );
}

const CashContent = ({
  protocol,
  outOfMint,
  inscriptionNumber,
  tokenSummary,
  ticker
}: {
  protocol: 'orc-20' | 'orc-cash';
  outOfMint: boolean;
  inscriptionNumber: string;
  tokenSummary: AddressTokenSummary;
  ticker: string;
}) => {
  const navigate = useNavigate();

  return (
    <Column mt="lg">
      <Grid columns={2} style={{ marginBottom: '20px' }}>
        <Button
          text="MINT"
          preset="primary"
          style={outOfMint ? { backgroundColor: 'grey' } : {}}
          disabled={outOfMint}
          icon="pencil"
          onClick={(e) => {
            window.open(
              `https://infosat.io${protocol === 'orc-20' ? '/orc-20' : ''}/token/${encodeURIComponent(
                inscriptionNumber
              )}`
            );
          }}
          full
        />

        <Button
          text="SEND"
          preset="primary"
          icon="send"
          onClick={(e) => {
            // todo
            const defaultSelected = tokenSummary.transferableList.slice(0, 1);
            const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
            const selectedAmount = defaultSelected.reduce((pre, cur) => parseInt(cur.amount) + pre, 0);
            navigate('ORC20SendScreen', {
              tokenBalance: tokenSummary.tokenBalance,
              inscriptionNumber,
              selectedInscriptionIds,
              selectedAmount,
              protocol
            });
          }}
          full
        />
        <Button
          text="CONVERT"
          preset="primary"
          icon="switch"
          onClick={(e) => {
            // todo
            const receiver = () => {
              switch (protocol) {
                case 'orc-20':
                  return ORC20_ATM_ADDRESS;
                case 'orc-cash':
                  return ORC_CASH_ATM_ADDRESS;
                default:
                  return '';
              }
            };
            const defaultSelected = tokenSummary.transferableList.slice(0, 1);
            const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
            const selectedAmount = defaultSelected.reduce((pre, cur) => parseInt(cur.amount) + pre, 0);
            navigate('ORC20SendScreen', {
              tokenBalance: tokenSummary.tokenBalance,
              inscriptionNumber,
              selectedInscriptionIds,
              selectedAmount,
              protocol,
              receiver: receiver()
            });
          }}
        />
      </Grid>
      <CashAvailableList tokenSummary={tokenSummary} ticker={ticker} />
    </Column>
  );
};

const CashAvailableList = ({ tokenSummary, ticker }: { tokenSummary: AddressTokenSummary; ticker: string }) => {
  const [transferableListExpanded, setTransferableListExpanded] = useState(true);

  return (
    <Column>
      <Row justifyBetween>
        <Row itemsCenter>
          <Text text="Available" preset="bold" size="lg" />
        </Row>
        {/* <Text
          text={`${formatNumber(tokenSummary.tokenBalance.transferableBalance)} ${ticker}`}
          preset="bold"
          size="lg"
        /> */}
      </Row>
      {tokenSummary.transferableList.length == 0 && (
        <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
          <Empty text="Empty" />
        </Column>
      )}
      {transferableListExpanded ? (
        <Row overflowX>
          {/* <Text
          text="HIDE"
          size="xxl"
          onClick={() => {
            setTransferableListExpanded(false);
          }}
        /> */}
          {tokenSummary.transferableList.map((v) => (
            <BRC20Preview
              key={v.inscriptionId}
              tick={ticker}
              balance={formatNumber(v.amount)}
              inscriptionNumber={v.inscriptionNumber}
              timestamp={v.timestamp}
              type={v.type}
              // onClick={() => {
              //   navigate('BRC20SendScreen', {
              //     tokenBalance: tokenSummary.tokenBalance,
              //     selectedInscriptionIds: [v.inscriptionId]
              //   });
              // }}
            />
          ))}
        </Row>
      ) : (
        tokenSummary.transferableList.length > 0 && (
          <BRC20Preview
            tick={ticker}
            balance={formatNumber(tokenSummary.transferableList[0].amount)}
            inscriptionNumber={tokenSummary.transferableList[0].inscriptionNumber}
            timestamp={tokenSummary.transferableList[0].timestamp}
            onClick={() => {
              setTransferableListExpanded(true);
            }}
          />
        )
      )}
    </Column>
  );
};

const CreditContent = () => {
  const btns: {
    label: string;
    icon: IconTypes;
    click: () => void;
  }[] = [
    // {
    //   label: 'SELL',
    //   icon: 'sell',
    //   click: () => {
    //     window.open(`https://infosat.io/inscribe?op=airdrop`);
    //   }
    // },
    {
      label: 'AIRDROP',
      icon: 'airdrop',
      click: () => {
        window.open(`https://infosat.io/inscribe?op=airdrop`);
      }
    }
    // {
    //   label: 'LOCK',
    //   icon: 'lock',
    //   click: () => {
    //     window.open(`https://infosat.io/inscribe?op=airdrop`);
    //   }
    // },
    // {
    //   label: 'BURN',
    //   icon: 'burn',
    //   click: () => {
    //     window.open(`https://infosat.io/inscribe?op=airdrop`);
    //   }
    // }
  ];

  return (
    <Column style={{ marginTop: '12px' }}>
      <Grid columns={2}>
        {btns.map((item, index) => {
          return <Button key={index} text={item.label} preset="primary" icon={item.icon} onClick={item.click} full />;
        })}
      </Grid>
    </Column>
  );
};

const VoteContent = () => {
  const btns: {
    label: string;
    icon: IconTypes;
    click: () => void;
  }[] = [
    {
      label: 'PROPOSE',
      icon: 'propose',
      click: () => {
        window.open(`https://infosat.io/inscribe?op=airdrop`);
      }
    },
    {
      label: 'VOTE',
      icon: 'vote',
      click: () => {
        window.open(`https://infosat.io/inscribe?op=airdrop`);
      }
    }
  ];

  const contentList = [
    `Participatated in the proposal(${2})`,
    `Total votes(${formatNumber(42000000)})`,
    `Proposals currently initiated by you(${0})`,
    `Proposals currently involved(${1})`
  ];
  return (
    <Column style={{ marginTop: '12px' }} gap={'xl'}>
      <Grid columns={2}>
        {btns.map((item, index) => {
          return <Button key={index} text={item.label} preset="primary" icon={item.icon} onClick={item.click} full />;
        })}
      </Grid>

      <Row justifyBetween>
        <Text text="Valid Votes" preset="bold" size="lg" />
        <Text text={formatNumber(40000000)} preset="bold" size="lg" />
      </Row>
      <Column>
        <Text text="Voted Data" preset="bold" size="lg" />
        <List
          size="small"
          style={{ marginLeft: '20px' }}
          dataSource={contentList.map((s) => {
            return { title: s };
          })}
          bordered={false}
          itemLayout="vertical"
          locale={{ emptyText: 'Empty' }}
          renderItem={(item) => (
            <li style={{ padding: '0 0 6px 0', listStyle: 'disc', color: 'rgba(255, 255, 255, 0.5)' }}>
              <Text text={item.title} color="white_muted" size="md" />
            </li>
          )}
          split={false}
        />
      </Column>
    </Column>
  );
};
