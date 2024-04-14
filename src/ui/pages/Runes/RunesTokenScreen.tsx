import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressRunesTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useUnisatWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  runeid: string;
}

export default function RunesTokenScreen() {
  const { runeid } = useLocationState<LocationState>();
  const [tokenSummary, setTokenSummary] = useState<AddressRunesTokenSummary>({
    runeBalance: {
      runeid: '',
      rune: '',
      spacedRune: '',
      amount: '',
      symbol: '',
      divisibility: 0
    },
    runeInfo: {
      rune: '',
      runeid: '',
      spacedRune: '',
      symbol: '',
      premine: '',
      mints: '',
      divisibility: 0,
      etching: '',
      terms: {
        amount: '',
        cap: '',
        heightStart: 0,
        heightEnd: 0,
        offsetStart: 0,
        offsetEnd: 0
      },
      number: 0,
      height: 0,
      txidx: 0,
      timestamp: 0,
      burned: '',
      holders: 0,
      transactions: 0
    },
    mint: {
      mintable: false,
      remaining: '',
      start: 0,
      end: 0
    }
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.getAddressRunesTokenSummary(account.address, runeid).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const unisatWebsite = useUnisatWebsite();

  const enableMint = tokenSummary.mint.mintable;

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.runeBalance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const tools = useTools();
  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }
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
              <Text
                text={`${runesUtils.toDecimalAmount(
                  tokenSummary.runeBalance.amount,
                  tokenSummary.runeBalance.divisibility
                )}`}
                preset="bold"
                textCenter
                size="xxl"
                wrap
              />
              <BRC20Ticker tick={tokenSummary.runeBalance.symbol} preset="lg" />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text="Mint"
                preset="primary"
                style={!enableMint ? { backgroundColor: 'grey' } : {}}
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`${unisatWebsite}/inscribe`);
                }}
                full
              />

              <Button
                text="Send"
                preset="primary"
                icon="send"
                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                disabled={!enableTransfer}
                onClick={(e) => {
                  navigate('SendRunesScreen', {
                    runeBalance: tokenSummary.runeBalance,
                    runeInfo: tokenSummary.runeInfo
                  });
                }}
                full
              />
            </Row>
          </Column>

          <Column gap="lg">
            <Section title="rune" value={tokenSummary.runeInfo.spacedRune} />
            <Section title="runeid" value={tokenSummary.runeInfo.runeid} />
            <Section title="premine" value={tokenSummary.runeInfo.premine} />
            <Section title="mints" value={tokenSummary.runeInfo.mints} />
            <Section title="symbol" value={tokenSummary.runeInfo.symbol} />
            <Section title="divisibility" value={tokenSummary.runeInfo.divisibility} />
            <Section title="etching" value={tokenSummary.runeInfo.etching} />
            <Section title="holders" value={tokenSummary.runeInfo.holders} />
          </Column>
        </Content>
      )}
    </Layout>
  );
}

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
  const tools = useTools();
  return (
    <Column>
      <Text text={title} preset="sub" />
      <Text
        text={value}
        preset={link ? 'link' : 'regular'}
        size="xs"
        wrap
        onClick={() => {
          if (link) {
            window.open(link);
          } else {
            copyToClipboard(value).then(() => {
              tools.toastSuccess('Copied');
            });
          }
        }}
      />
    </Column>
  );
}
