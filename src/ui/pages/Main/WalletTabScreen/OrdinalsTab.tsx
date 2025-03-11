import { useMemo } from 'react';

import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAddressSummary } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import { useOrdinalsAssetTabKey } from '@/ui/state/ui/hooks';
import { OrdinalsAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { BRC20List } from './Brc20List';
import { InscriptionList } from './InscriptionList';

export function OrdinalsTab() {
  const addressSummary = useAddressSummary();

  const chain = useChain();

  let tabKey = useOrdinalsAssetTabKey();
  if (chain.isFractal && tabKey === OrdinalsAssetTabKey.BRC20_5BYTE) {
    tabKey = OrdinalsAssetTabKey.BRC20;
  }
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

    // if (!chain.isFractal) {
    //   items.push({
    //     key: OrdinalsAssetTabKey.BRC20_5BYTE,
    //     label: `brc-20[5-byte] (${addressSummary.brc20Count5Byte || 0})`,
    //     children: <BRC20List5Byte />
    //   });
    // }
    return items;
  }, [addressSummary, chain]);

  return (
    <Column>
      <Row justifyBetween>
        <TabBar
          defaultActiveKey={tabKey}
          activeKey={tabKey}
          items={tabItems}
          preset="style2"
          onTabClick={(key) => {
            dispatch(uiActions.updateAssetTabScreen({ ordinalsAssetTabKey: key }));
          }}
        />
      </Row>

      {tabItems[tabKey] ? tabItems[tabKey].children : null}
    </Column>
  );
}
