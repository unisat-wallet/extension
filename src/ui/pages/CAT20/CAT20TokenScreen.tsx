import { useEffect, useMemo, useState } from 'react';

import { AddressCAT20TokenSummary, CAT_VERSION } from '@/shared/types';
import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { showLongNumber } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { bnUtils } from '@unisat/base-utils';
import { KeyringType } from '@unisat/keyring-service/types';
import {
  useCAT20IconInfo,
  useCAT20MarketPlaceWebsite,
  useCAT20TokenInfoExplorerUrl,
  useChainType,
  useCurrentAccount,
  useCurrentKeyring,
  useI18n,
  useNavigation,
  useTools,
  useWallet
} from '@unisat/wallet-state';

import { TokenScreenIcon } from '@/ui/components/TokenScreenIcon';
import { ChainType } from '@unisat/wallet-types';
import { useNavigate } from '../MainRoute';

interface LocationState {
  tokenId: string;
  version: CAT_VERSION;
}

export default function CAT20TokenScreen() {
  const nav = useNavigation();
  const { tokenId, version } = nav.getRouteState<LocationState>();
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
  const { t } = useI18n();

  const account = useCurrentAccount();

  const keyring = useCurrentKeyring();
  const tools = useTools();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.getAddressCAT20TokenSummary(version, account.address, tokenId).then((tokenSummary) => {
      setTokenSummary(tokenSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const tokenUrl = useCAT20TokenInfoExplorerUrl(version, tokenSummary?.cat20Info?.tokenId);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.cat20Balance && tokenSummary.cat20Balance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const chainType = useChainType();
  const enableTrade = useMemo(() => {
    if (chainType === ChainType.FRACTAL_BITCOIN_MAINNET && version === CAT_VERSION.V1) {
      return true;
    } else {
      return false;
    }
  }, [chainType]);
  const marketPlaceUrl = useCAT20MarketPlaceWebsite(tokenId);

  const iconInfo = useCAT20IconInfo(tokenSummary.cat20Info.name, tokenId);

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

  if (!tokenSummary || !tokenSummary.cat20Balance || !tokenSummary.cat20Info) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
        />
        <Content itemsCenter justifyCenter>
          <Text text={t('token_not_found')} />
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
          <Column justifyCenter itemsCenter>
            <TokenScreenIcon iconInfo={iconInfo} />
            <Row justifyCenter itemsCenter>
              <BRC20Ticker tick={tokenSummary.cat20Info.name} preset="md" showOrigin color={'ticker_color2'} />
            </Row>
            <Column itemsCenter fullX justifyCenter>
              <Text
                text={`${bnUtils.toDecimalAmount(
                  tokenSummary.cat20Balance.amount,
                  tokenSummary.cat20Balance.decimals
                )} `}
                preset="bold"
                textCenter
                size="xxl"
                wrap
                digital
                color="white"
              />
            </Column>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice
                tick={tokenSummary.cat20Info.tokenId}
                balance={bnUtils.toDecimalAmount(tokenSummary.cat20Balance.amount, tokenSummary.cat20Balance.decimals)}
                type={TokenType.CAT20}
                size={'md'}
              />
            </Row>
          </Column>

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 15
            }}>
            <Section title={t('token_id')} value={tokenSummary.cat20Info.tokenId} link={tokenUrl} />
            <Line />
            <Section title={t('name')} value={tokenSummary.cat20Info.name} />
            <Line />

            <Section title={t('symbol')} value={tokenSummary.cat20Info.symbol} />
            <Line />

            <Section title={t('decimals')} value={tokenSummary.cat20Balance.decimals} />
            <Line />

            <Section
              title={t('supply')}
              value={`${showLongNumber(bnUtils.toDecimalAmount(tokenSummary.cat20Info.max, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />
            <Line />

            <Section
              title={t('premine')}
              value={`${showLongNumber(bnUtils.toDecimalAmount(tokenSummary.cat20Info.premine, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />
          </Column>
        </Content>
      )}

      <Footer
        style={{
          borderTopWidth: 1,
          borderColor: colors.border2
        }}>
        <Column gap="sm" fullX>
          <Row gap="sm" mt="sm" mb="md">
            <Button
              text={t('merge_utxos')}
              preset="brc20-action"
              icon="merge"
              onClick={(e) => {
                if (keyring.type === KeyringType.KeystoneKeyring) {
                  tools.toastError(t('merge_utxos_is_not_supported_for_keystone_yet'));
                  return;
                }
                navigate('MergeCAT20Screen', {
                  version: version,
                  cat20Balance: tokenSummary.cat20Balance,
                  cat20Info: tokenSummary.cat20Info
                });
              }}
              full
            />

            <Button
              text={t('send')}
              preset="brc20-action"
              icon="send"
              disabled={!enableTransfer}
              onClick={(e) => {
                if (keyring.type === KeyringType.KeystoneKeyring) {
                  tools.toastError(t('send_cat20_is_not_supported_for_keystone_yet'));
                  return;
                }
                navigate('SendCAT20Screen', {
                  version: version,
                  cat20Balance: tokenSummary.cat20Balance,
                  cat20Info: tokenSummary.cat20Info
                });
              }}
              full
            />

            <Button
              text={t('trade')}
              preset="brc20-action"
              icon="trade"
              disabled={!enableTrade}
              onClick={(e) => {
                window.open(marketPlaceUrl);
              }}
              full
            />
          </Row>
        </Column>
      </Footer>
    </Layout>
  );
}
