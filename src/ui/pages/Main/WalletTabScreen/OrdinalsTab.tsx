import { useMemo } from 'react';

import { Column } from '@/ui/components';
import {
  OrdinalsAssetTabKey,
  uiActions,
  useAddressSummary,
  useAppDispatch,
  useChain,
  useI18n,
  useOrdinalsAssetTabKey
} from '@unisat/wallet-state';

import { Tabs } from '@/ui/components/Tabs';
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
      <Tabs
        defaultActiveKey={finalTabKey as unknown as string}
        activeKey={finalTabKey as unknown as string}
        items={tabItems as unknown as any[]}
        onTabClick={(key) => {
          dispatch(uiActions.updateAssetTabScreen({ ordinalsAssetTabKey: key }));
        }}
        preset="style2"
      />
    </Column>
  );
}
