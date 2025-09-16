import { useMemo } from 'react';

import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAddressSummary } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import { useOrdinalsAssetTabKey } from '@/ui/state/ui/hooks';
import { OrdinalsAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { BRC20ProgList } from './BRC20ProgList';
import { BRC20List } from './Brc20List';
import { InscriptionList } from './InscriptionList';

export function OrdinalsTab() {
  const addressSummary = useAddressSummary();

  const chain = useChain();

  const tabKey = useOrdinalsAssetTabKey();

  const { t } = useI18n();

  const dispatch = useAppDispatch();

  const tabItems = useMemo(() => {
    const items = [
      {
        key: OrdinalsAssetTabKey.ALL,
        label: `${t('all')} (${addressSummary.inscriptionCount})`,
        children: <InscriptionList />
      },
      {
        key: OrdinalsAssetTabKey.BRC20,
        label: `brc-20 (${addressSummary.brc20Count})`,
        children: <BRC20List />
      }
    ];

    if (chain.enableBrc20Prog) {
      items.push({
        key: OrdinalsAssetTabKey.BRC20_6BYTE,
        label: `brc2.0 (${addressSummary.brc20Count6Byte || 0})`,
        children: <BRC20ProgList />
      });
    }
    return items;
  }, [addressSummary, chain]);

  const finalTabKey = useMemo(() => {
    if (tabKey === OrdinalsAssetTabKey.BRC20_6BYTE && !chain.enableBrc20Prog) {
      return OrdinalsAssetTabKey.BRC20;
    }
    return tabKey;
  }, [tabKey, chain]);

  return (
    <Column>
      <Row justifyBetween>
        <TabBar
          defaultActiveKey={finalTabKey}
          activeKey={finalTabKey}
          items={tabItems}
          preset="style2"
          onTabClick={(key) => {
            dispatch(uiActions.updateAssetTabScreen({ ordinalsAssetTabKey: key }));
          }}
        />
      </Row>

      {tabItems[finalTabKey] ? tabItems[finalTabKey].children : null}
    </Column>
  );
}
