import { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { runesUtils } from '@/shared/lib/runes-utils';
import { AddressRunesTokenSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  useChainType,
  useOrdinalsWebsite,
  useRunesMarketPlaceWebsite,
  useTxExplorerUrl,
  useUnisatWebsite
} from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, showLongNumber, useLocationState, useWallet } from '@/ui/utils';
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
      transactions: 0,
      mintable: false,
      remaining: '',
      start: 0,
      end: 0,
      supply: '0',
      parent: ''
    }
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  const { t } = useI18n();

  useEffect(() => {
    wallet.getAddressRunesTokenSummary(account.address, runeid).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const unisatWebsite = useUnisatWebsite();

  const enableMint = tokenSummary.runeInfo.mintable;

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.runeBalance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const tools = useTools();

  const ordinalsWebsite = useOrdinalsWebsite();

  const txExplorerUrl = useTxExplorerUrl(tokenSummary.runeInfo.etching);

  const chainType = useChainType();
  const enableTrade = useMemo(() => {
    if (chainType === ChainType.BITCOIN_MAINNET || chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
      return true;
    } else {
      return false;
    }
  }, [chainType]);
  const marketPlaceUrl = useRunesMarketPlaceWebsite(tokenSummary.runeInfo.spacedRune);

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
                digital
              />
              <BRC20Ticker tick={tokenSummary.runeBalance.symbol} preset="lg" />
            </Row>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice
                tick={tokenSummary.runeInfo.spacedRune}
                balance={runesUtils.toDecimalAmount(
                  tokenSummary.runeBalance.amount,
                  tokenSummary.runeBalance.divisibility
                )}
                type={TokenType.RUNES}
                size={'md'}
              />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text={t('mint')}
                preset="home"
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`${unisatWebsite}/runes/inscribe?tab=mint&rune=${tokenSummary.runeInfo.rune}`);
                }}
                full
              />

              <Button
                text={t('send')}
                preset="home"
                icon="send"
                disabled={!enableTransfer}
                onClick={(e) => {
                  navigate('SendRunesScreen', {
                    runeBalance: tokenSummary.runeBalance,
                    runeInfo: tokenSummary.runeInfo
                  });
                }}
                full
              />

              {enableTrade ? (
                <Button
                  text={t('trade')}
                  preset="home"
                  icon="trade"
                  disabled={!enableTrade}
                  onClick={(e) => {
                    window.open(marketPlaceUrl);
                  }}
                  full
                />
              ) : null}
            </Row>
          </Column>

          <Text
            text={tokenSummary.runeInfo.spacedRune}
            preset="title-bold"
            onClick={() => {
              copyToClipboard(tokenSummary.runeInfo.spacedRune).then(() => {
                tools.toastSuccess(t('copied'));
              });
            }}></Text>
          {tokenSummary.runeLogo ? (
            <Row>
              <InscriptionPreview data={tokenSummary.runeLogo} preset="small" asLogo />
            </Row>
          ) : null}

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 15
            }}>
            <Section title={t('runeid')} value={tokenSummary.runeInfo.runeid} />
            <Line />
            <Section title={t('mints')} value={showLongNumber(tokenSummary.runeInfo.mints)} />
            <Line />

            <Section
              title={t('current_supply')}
              value={`${showLongNumber(
                runesUtils.toDecimalAmount(tokenSummary.runeInfo.supply, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section
              title={t('premine')}
              value={`${showLongNumber(
                runesUtils.toDecimalAmount(tokenSummary.runeInfo.premine, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section
              title={t('burned')}
              value={`${showLongNumber(
                runesUtils.toDecimalAmount(tokenSummary.runeInfo.burned, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section title={t('divisibility')} value={tokenSummary.runeInfo.divisibility} />
            <Line />

            <Section title={t('symbol')} value={tokenSummary.runeInfo.symbol} />
            <Line />

            <Section title={t('holders')} value={showLongNumber(tokenSummary.runeInfo.holders)} />
            <Line />

            <Section title={t('transactions')} value={showLongNumber(tokenSummary.runeInfo.transactions)} />
            <Line />

            <Section title={t('etching')} value={tokenSummary.runeInfo.etching} link={txExplorerUrl} />
            {tokenSummary.runeInfo.parent ? <Line /> : null}

            {tokenSummary.runeInfo.parent ? (
              <Section
                title={t('parent')}
                value={tokenSummary.runeInfo.parent}
                link={`${ordinalsWebsite}/inscription/${tokenSummary.runeInfo.parent}`}
              />
            ) : null}
          </Column>
        </Content>
      )}
    </Layout>
  );
}
