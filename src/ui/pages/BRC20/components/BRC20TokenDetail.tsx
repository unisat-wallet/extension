import { Column, Text } from '@/ui/components';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { shortAddress, showLongNumber } from '@/ui/utils';
import { AddressTokenSummary, Inscription } from '@unisat/wallet-shared';
import { useI18n, useNavigation } from '@unisat/wallet-state';

export function BRC20TokenDetail(props: {
  ticker: string;
  deployInscription: Inscription;
  tokenSummary: AddressTokenSummary;
}) {
  const { t } = useI18n();
  const nav = useNavigation();
  const { ticker, tokenSummary, deployInscription } = props;
  return (
    <Column>
      <Column
        gap="lg"
        px="md"
        py="md"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 15,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)'
        }}>
        <Section title={t('ticker')} value={ticker} />
        <Line />

        {deployInscription ? (
          <Section
            title={t('deploy_inscription')}
            value={''}
            rightComponent={
              <Text
                text={shortAddress(deployInscription.inscriptionId, 10)}
                color={'gold'}
                preset="link"
                size="xs"
                onClick={() => {
                  nav.navigate('OrdinalsInscriptionScreen', { inscription: deployInscription, withSend: true });
                }}
              />
            }
          />
        ) : null}
        {deployInscription ? <Line /> : null}

        <Section title={t('minted')} value={showLongNumber(tokenSummary.tokenInfo.totalMinted)} maxLength={100} />
        <Line />

        <Section title={t('supply')} value={showLongNumber(tokenSummary.tokenInfo.totalSupply)} maxLength={100} />
        <Line />

        <Section title={t('decimal')} value={tokenSummary.tokenInfo.decimal} />

        <Section title={t('holders_count')} value={showLongNumber(tokenSummary.tokenInfo.holdersCount)} />

        <Section title={t('history_count')} value={showLongNumber(tokenSummary.tokenInfo.historyCount)} />
      </Column>
    </Column>
  );
}
