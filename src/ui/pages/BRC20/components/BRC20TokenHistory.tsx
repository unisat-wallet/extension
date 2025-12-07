import { Column, Icon, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { useBRC20TokenHistoryLogic, useI18n, useNavigation } from '@unisat/wallet-state';

export function BRC20TokenHistory(props: { ticker: string; displayName?: string }) {
  const { t } = useI18n();
  const nav = useNavigation();
  const { isEmpty, isFailed, displayItems } = useBRC20TokenHistoryLogic(props);

  if (isFailed) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Text text={t('load_failed')} preset="sub" />
      </Column>
    );
  }

  if (isEmpty) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Text text={t('empty')} preset="sub" />
      </Column>
    );
  }

  return (
    <Column fullX>
      {displayItems.map(({ date, items }) => (
        <Column key={date} fullX gap="md" mb="md">
          <Text text={date} preset="sub" />
          {items
            .filter((item): item is NonNullable<typeof item> => item != null)
            .map((item) => (
              <Row
                key={item.key}
                fullX
                justifyBetween
                justifyCenter
                py="md"
                style={{ borderBottomWidth: 1, borderColor: colors.border2 }}>
                <Row itemsCenter>
                  <Row
                    onClick={() => {
                      nav.navToExplorerTx(item.txid);
                    }}>
                    <Icon icon={item.icon as any} size={32} />
                  </Row>

                  <Column>
                    <Row style={{ alignItems: 'start' }}>
                      <Text text={item.mainTitle} />

                      {item.pending ? (
                        <Row style={{ backgroundColor: 'rgba(244, 182, 44, 0.15)', borderRadius: 4 }} px="md" py="xs">
                          <Text text={t('history_pending')} style={{ color: 'rgba(244, 182, 44, 0.85)' }} size="xs" />
                        </Row>
                      ) : null}
                    </Row>

                    <Row>
                      <Text text={item.subTitle} preset="sub" />
                    </Row>
                  </Column>
                </Row>

                {item.amount !== '0' ? (
                  <Row itemsCenter>
                    <Text text={item.amount} />
                    <Text text={props.displayName || props.ticker} preset="sub" />
                  </Row>
                ) : null}
              </Row>
            ))}
        </Column>
      ))}
    </Column>
  );
}
