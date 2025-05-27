import { useMemo } from 'react';

import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { useAppDispatch } from '@/ui/state/hooks';
import { useAlkanesAssetTabKey } from '@/ui/state/ui/hooks';
import { AlkanesAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { AlkanesCollectionList } from './AlkanesCollectionList';
import { AlkanesList } from './AlkanesList';

export function AlkanesTab() {
  const tabKey = useAlkanesAssetTabKey();

  const dispatch = useAppDispatch();

  const tabItems = useMemo(() => {
    const items = [
      {
        key: AlkanesAssetTabKey.TOKEN,
        label: 'Tokens',
        children: <AlkanesList />
      },
      {
        key: AlkanesAssetTabKey.COLLECTION,
        label: 'Collections',
        children: <AlkanesCollectionList />
      }
    ];

    return items;
  }, []);

  return (
    <Column>
      <Row justifyBetween>
        <TabBar
          defaultActiveKey={tabKey}
          activeKey={tabKey}
          items={tabItems}
          preset="style2"
          onTabClick={(key) => {
            dispatch(uiActions.updateAssetTabScreen({ alkanesAssetTabKey: key }));
          }}
        />
      </Row>

      {tabItems[tabKey] ? tabItems[tabKey].children : null}
    </Column>
  );
}
