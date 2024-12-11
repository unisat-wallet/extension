import { useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressCAT20TokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useCAT20TokenInfoExplorerUrl } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, showLongNumber, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  tokenId: string;
}

export default function CAT20TokenScreen() {
  const { tokenId } = useLocationState<LocationState>();
  const [tokenSummary, setTokenSummary] = useState<AddressCAT20TokenSummary>({
    cat20Balance: {
      tokenId: '',
      amount: '0',
      decimals: 0,
      symbol: '',
      name: ''
    },
    cat20Info: {
      tokenId: '',
      name: '',
      symbol: '',
      max: '0',
      premine: '0',
      limit: 0
    }
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const keyring = useCurrentKeyring();
  const tools = useTools();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.getAddressCAT20TokenSummary(account.address, tokenId).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const tokenUrl = useCAT20TokenInfoExplorerUrl(tokenSummary.cat20Info.tokenId);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.cat20Balance && tokenSummary.cat20Balance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

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

  if (!tokenSummary || !tokenSummary.cat20Balance) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
        />
        <Content itemsCenter justifyCenter>
          <Text text="Token not found" />
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
          <Column py="xl" pb="lg" style={{ borderBottomWidth: 1, borderColor: colors.white_muted }}>
            <Text text={tokenSummary.cat20Info.name} preset="title-bold" textCenter size="xxl" color="gold" />
            <Row itemsCenter fullX justifyCenter>
              <Text
                text={`${runesUtils.toDecimalAmount(
                  tokenSummary.cat20Balance.amount,
                  tokenSummary.cat20Balance.decimals
                )}`}
                preset="bold"
                textCenter
                size="xxl"
                wrap
                digital
              />
              <BRC20Ticker tick={tokenSummary.cat20Info.symbol} preset="lg" />
            </Row>

            <Row justifyCenter fullX>
              <TickUsdWithoutPrice
                tick={tokenSummary.cat20Info.tokenId}
                balance={runesUtils.toDecimalAmount(
                  tokenSummary.cat20Balance.amount,
                  tokenSummary.cat20Balance.decimals
                )}
                type={TokenType.CAT20}
                size={'md'}
              />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text="Merge UTXOs"
                preset="defaultV2"
                icon="merge"
                onClick={(e) => {
                  if (keyring.type === KEYRING_TYPE.KeystoneKeyring) {
                    tools.toastError('Merge UTXOs is not supported for Keystone yet');
                    return;
                  }
                  navigate('MergeCAT20Screen', {
                    cat20Balance: tokenSummary.cat20Balance,
                    cat20Info: tokenSummary.cat20Info
                  });
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
                  if (keyring.type === KEYRING_TYPE.KeystoneKeyring) {
                    tools.toastError('Send CAT20 is not supported for Keystone yet');
                    return;
                  }
                  navigate('SendCAT20Screen', {
                    cat20Balance: tokenSummary.cat20Balance,
                    cat20Info: tokenSummary.cat20Info
                  });
                }}
                full
              />
            </Row>

            {/* <Row mb="zero">
              <Text
                text="Merge History ->"
                preset="sub"
                onClick={() => {
                  navigate('MergeCAT20HistoryScreen', {
                    cat20Info: tokenSummary.cat20Info
                  });
                }}
              />
            </Row> */}
          </Column>

          <Column gap="lg">
            <Section title="token_id" value={tokenSummary.cat20Info.tokenId} link={tokenUrl} />

            <Section title="name" value={tokenSummary.cat20Info.name} />

            <Section title="symbol" value={tokenSummary.cat20Info.symbol} />

            <Section title="decimals" value={tokenSummary.cat20Balance.decimals} />

            <Section
              title="supply"
              value={`${showLongNumber(runesUtils.toDecimalAmount(tokenSummary.cat20Info.max, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />

            <Section
              title="premine"
              value={`${showLongNumber(runesUtils.toDecimalAmount(tokenSummary.cat20Info.premine, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />
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
