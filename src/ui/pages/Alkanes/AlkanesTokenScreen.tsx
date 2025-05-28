import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressAlkanesTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { WarningPopover } from '@/ui/components/WarningPopover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, showLongNumber, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  alkaneid: string;
}

export default function AlkanesTokenScreen() {
  const { alkaneid } = useLocationState<LocationState>();
  const [tokenSummary, setTokenSummary] = useState<AddressAlkanesTokenSummary>({
    tokenBalance: {
      alkaneid: '',
      name: '',
      amount: '',
      symbol: '',
      divisibility: 0,
      available: ''
    },
    tokenInfo: {
      alkaneid: '',
      name: '',
      symbol: '',
      totalSupply: '10000000000000',
      maxSupply: '10000000000000',
      cap: 0,
      mintable: false,
      perMint: '0',
      minted: 0,
      holders: 0,
      aligned: true,
      nftData: {
        collectionId: ''
      },
      logo: ''
    },
    tradeUrl: '',
    mintUrl: ''
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  const [warning, setWarning] = useState(false);

  const { t } = useI18n();

  useEffect(() => {
    wallet.getAddressAlkanesTokenSummary(account.address, alkaneid, false).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const enableMint = useMemo(() => {
    return tokenSummary.mintUrl && tokenSummary.mintUrl.trim() !== '';
  }, [tokenSummary.mintUrl]);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.tokenBalance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const tools = useTools();

  const enableTrade = useMemo(() => {
    return tokenSummary.tradeUrl && tokenSummary.tradeUrl.trim() !== '';
  }, [tokenSummary.tradeUrl]);

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

  const sendAlkanes = () => {
    if (tokenSummary.tokenInfo?.aligned === false) {
      // tools.toastError(t('important_to_not_transfer_this_token'));
      setWarning(true);
      return;
    }
    navigate('SendAlkanesScreen', {
      tokenBalance: tokenSummary.tokenBalance,
      tokenInfo: tokenSummary.tokenInfo
    });
  };

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
                  tokenSummary.tokenBalance.amount,
                  tokenSummary.tokenBalance.divisibility
                )}`}
                preset="bold"
                textCenter
                size="xxl"
                wrap
                digital
              />
              <BRC20Ticker tick={tokenSummary.tokenBalance.symbol} preset="lg" />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text={t('mint')}
                preset="home"
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  if (tokenSummary.mintUrl) {
                    window.open(tokenSummary.mintUrl);
                  }
                }}
                full
              />

              <Button
                text={t('send')}
                preset="home"
                icon="send"
                disabled={!enableTransfer}
                onClick={sendAlkanes}
                full
              />

              <Button
                text={t('trade')}
                preset="home"
                icon="trade"
                disabled={!enableTrade}
                onClick={(e) => {
                  if (tokenSummary.tradeUrl) {
                    window.open(tokenSummary.tradeUrl);
                  }
                }}
                full
              />
            </Row>
          </Column>

          <Text
            text={tokenSummary.tokenInfo.name}
            preset="title-bold"
            onClick={() => {
              copyToClipboard(tokenSummary.tokenInfo.name).then(() => {
                tools.toastSuccess(t('copied'));
              });
            }}></Text>

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 15
            }}>
            <Section title={'Alkanes ID'} value={tokenSummary.tokenBalance.alkaneid} />
            <Line />

            <Section title={t('name_label')} value={tokenSummary.tokenBalance.name} />
            <Line />

            <Section title={t('symbol_alkanes')} value={tokenSummary.tokenBalance.symbol} />
            <Line />

            <Section title={t('decimals_alkanes')} value={tokenSummary.tokenBalance.divisibility} />
            <Line />

            <Section title={t('holders_alkanes')} value={showLongNumber(tokenSummary.tokenInfo.holders)} />
            <Line />

            <Section
              title={t('total_supply')}
              value={`${
                tokenSummary.tokenInfo.totalSupply
                  ? showLongNumber(
                      runesUtils.toDecimalAmount(
                        tokenSummary.tokenInfo.totalSupply.toString(),
                        tokenSummary.tokenBalance.divisibility
                      )
                    )
                  : '--'
              }/${
                tokenSummary.tokenInfo.maxSupply && tokenSummary.tokenInfo.maxSupply !== '0'
                  ? showLongNumber(
                      runesUtils.toDecimalAmount(
                        tokenSummary.tokenInfo.maxSupply.toString(),
                        tokenSummary.tokenBalance.divisibility
                      )
                    )
                  : '--'
              }`}
              maxLength={100}
            />
            <Line />

            <Section
              title={t('minted_alkanes')}
              value={`${showLongNumber(tokenSummary.tokenInfo.minted)}/${showLongNumber(tokenSummary.tokenInfo.cap)}`}
            />
            <Line />

            <Section
              title={t('per_mint')}
              value={
                tokenSummary.tokenInfo.perMint
                  ? `${showLongNumber(
                      runesUtils.toDecimalAmount(tokenSummary.tokenInfo.perMint, tokenSummary.tokenBalance.divisibility)
                    )} `
                  : '--'
              }
            />

            <Line />
          </Column>

          {warning && (
            <WarningPopover
              risks={[
                {
                  desc: t('important_to_not_transfer_this_token')
                }
              ]}
              onClose={() => {
                setWarning(false);
              }}
            />
          )}
        </Content>
      )}
    </Layout>
  );
}
