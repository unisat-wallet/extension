import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { brc20Utils } from '@/shared/lib/brc20-utils';
import { AddressTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Empty } from '@/ui/components/Empty';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useUnisatWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  ticker: string;
}

export default function BRC20TokenScreen() {
  const { ticker } = useLocationState<LocationState>();

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
      totalMinted: '',
      decimal: 18,
      holder: '',
      inscriptionId: ''
    },
    historyList: [],
    transferableList: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    wallet.getBRC20Summary(account.address, ticker).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const balance = useMemo(() => {
    if (!tokenSummary) {
      return '--';
    }
    return tokenSummary?.tokenBalance.overallBalance;
  }, [tokenSummary]);

  const navigate = useNavigate();

  const [transferableListExpanded, setTransferableListExpanded] = useState(true);

  const outOfMint = tokenSummary.tokenInfo.totalMinted == tokenSummary.tokenInfo.totalSupply;

  const shouldShowSafe = tokenSummary.tokenBalance.availableBalanceSafe !== tokenSummary.tokenBalance.availableBalance;
  const unisatWebsite = useUnisatWebsite();

  const hasBalance =
    tokenSummary.tokenBalance.overallBalance !== '0' && tokenSummary.tokenBalance.overallBalance !== '';

  const enableMint = useMemo(() => {
    let enable = false;
    if (brc20Utils.is5Byte(ticker)) {
      if (tokenSummary.tokenInfo.holder == account.address) {
        if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
          enable = true;
        }
      }
    } else {
      if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
        enable = true;
      }
    }
    return enable;
  }, [tokenSummary]);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.tokenBalance.overallBalance !== '0' && tokenSummary.tokenBalance.overallBalance !== '') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

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
            <Row itemsCenter fullX justifyCenter>
              <Text text={`${balance}`} preset="bold" textCenter size="xxl" wrap />
              <BRC20Ticker tick={ticker} preset="lg" />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text="MINT"
                preset="primary"
                style={!enableMint ? { backgroundColor: 'grey' } : {}}
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`${unisatWebsite}/brc20/${encodeURIComponent(ticker)}`);
                }}
                full
              />

              <Button
                text="TRANSFER"
                preset="primary"
                icon="send"
                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                disabled={!enableTransfer}
                onClick={(e) => {
                  // todo
                  const defaultSelected = tokenSummary.transferableList.slice(0, 1);
                  const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
                  const selectedAmount = defaultSelected.reduce(
                    (pre, cur) => new BigNumber(cur.amount).plus(pre),
                    new BigNumber(0)
                  );
                  navigate('BRC20SendScreen', {
                    tokenBalance: tokenSummary.tokenBalance,
                    selectedInscriptionIds,
                    selectedAmount: selectedAmount.toString()
                  });
                }}
                full
              />
            </Row>
          </Column>
          <Column>
            <Row justifyBetween>
              <Text text="Transferable" preset="bold" size="lg" />
              <Row itemsCenter>
                <Text text={`${tokenSummary.tokenBalance.transferableBalance}`} preset="bold" size="lg" wrap />
                <BRC20Ticker tick={ticker} />
              </Row>
            </Row>
            {tokenSummary.transferableList.length == 0 && (
              <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
                {loading ? (
                  <Icon>
                    <LoadingOutlined />
                  </Icon>
                ) : (
                  <Empty text="Empty" />
                )}
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
                    balance={v.amount}
                    inscriptionNumber={v.inscriptionNumber}
                    timestamp={v.timestamp}
                    type="TRANSFER"
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
                  balance={tokenSummary.transferableList[0].amount}
                  inscriptionNumber={tokenSummary.transferableList[0].inscriptionNumber}
                  timestamp={tokenSummary.transferableList[0].timestamp}
                  onClick={() => {
                    setTransferableListExpanded(true);
                  }}
                />
              )
            )}
          </Column>

          <Column mt="lg">
            <Row justifyBetween>
              <Text text="Available" preset="bold" size="lg" />
              {shouldShowSafe ? (
                <Column>
                  <Row gap="zero">
                    <Text text={`${tokenSummary.tokenBalance.availableBalanceSafe}`} preset="bold" size="lg" />
                    <Text text={'+'} preset="bold" size="lg" />
                    <Text
                      text={`${tokenSummary.tokenBalance.availableBalanceUnSafe}`}
                      preset="bold"
                      size="lg"
                      color="textDim"
                    />
                    <BRC20Ticker tick={ticker} />
                  </Row>
                  <Text text={'(Wait to be confirmed)'} preset="sub" textEnd />
                </Column>
              ) : (
                <Row itemsCenter>
                  <Text text={`${tokenSummary.tokenBalance.availableBalance}`} preset="bold" size="lg" wrap />
                  <BRC20Ticker tick={ticker} />
                </Row>
              )}
            </Row>
            {tokenSummary.historyList.length == 0 && (
              <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
                {loading ? (
                  <Icon>
                    <LoadingOutlined />
                  </Icon>
                ) : (
                  <Empty text="Empty" />
                )}
              </Column>
            )}
            <Row overflowX>
              {tokenSummary.historyList.map((v) => (
                <BRC20Preview
                  key={v.inscriptionId}
                  tick={ticker}
                  balance={v.amount}
                  inscriptionNumber={v.inscriptionNumber}
                  timestamp={v.timestamp}
                  type="MINT"
                />
              ))}
            </Row>
          </Column>
        </Content>
      )}
    </Layout>
  );
}
