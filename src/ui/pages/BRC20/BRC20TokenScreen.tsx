import { useEffect, useMemo, useState } from 'react';

import { AddressTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { Empty } from '@/ui/components/Empty';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { useLocationState, useWallet } from '@/ui/utils';

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
      totalMinted: ''
    },
    historyList: [],
    transferableList: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();
  useEffect(() => {
    wallet.getBRC20Summary(account.address, ticker).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
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
  const [availableListExpanded, setAvailableListExpanded] = useState(true);

  const outOfMint = tokenSummary.tokenInfo.totalMinted == tokenSummary.tokenInfo.totalSupply;

  const shouldShowSafe = tokenSummary.tokenBalance.availableBalanceSafe !== tokenSummary.tokenBalance.availableBalance;
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
            <Text text={`${balance} ${ticker}`} preset="bold" textCenter size="xxl" />
            <Row justifyBetween mt="lg">
              <Button
                text="MINT"
                preset="primary"
                style={outOfMint ? { backgroundColor: 'grey' } : {}}
                disabled={outOfMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`https://unisat.io/brc20/${encodeURIComponent(ticker)}`);
                }}
                full
              />

              <Button
                text="TRANSFER"
                preset="primary"
                icon="send"
                onClick={(e) => {
                  // todo
                  const defaultSelected = tokenSummary.transferableList.slice(0, 1);
                  const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
                  const selectedAmount = defaultSelected.reduce((pre, cur) => parseInt(cur.amount) + pre, 0);
                  navigate('BRC20SendScreen', {
                    tokenBalance: tokenSummary.tokenBalance,
                    selectedInscriptionIds,
                    selectedAmount
                  });
                }}
                full
              />
            </Row>
          </Column>
          <Column>
            <Row justifyBetween>
              <Text text="Transferable" preset="bold" size="lg" />
              <Text text={`${tokenSummary.tokenBalance.transferableBalance} ${ticker}`} preset="bold" size="lg" />
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
                    <Text text={`${ticker}`} preset="bold" size="lg" mx="md" />
                  </Row>
                  <Text text={'(Wait to be confirmed)'} preset="sub" textEnd />
                </Column>
              ) : (
                <Text text={`${tokenSummary.tokenBalance.availableBalance} ${ticker}`} preset="bold" size="lg" />
              )}
            </Row>
            {availableListExpanded ? (
              <Row overflowX>
                {/* <Text
                  text="HIDE"
                  size="xxl"
                  onClick={() => {
                    setAvailableListExpanded(false);
                  }}
                /> */}
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
            ) : (
              tokenSummary.historyList.length > 0 && (
                <BRC20Preview
                  tick={ticker}
                  balance={tokenSummary.historyList[0].amount}
                  inscriptionNumber={tokenSummary.historyList[0].inscriptionNumber}
                  timestamp={tokenSummary.historyList[0].timestamp}
                  onClick={() => {
                    setAvailableListExpanded(true);
                  }}
                />
              )
            )}
          </Column>
        </Content>
      )}
    </Layout>
  );
}
