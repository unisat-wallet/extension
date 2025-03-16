import { useMemo } from 'react';

import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCATAssetTabKey } from '@/ui/state/ui/hooks';
import { CATAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { CAT20List } from './CAT20List';
import { CAT721List } from './CAT721List';

export function CATTab() {
  const tabKey = useCATAssetTabKey();

  const dispatch = useAppDispatch();

  const tabItems = useMemo(() => {
    const items = [
      {
        key: CATAssetTabKey.CAT20,
        label: `CAT20`,
        children: <CAT20List />
      },
      {
        key: CATAssetTabKey.CAT721,
        label: `CAT721`,
        children: <CAT721List />
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
            dispatch(uiActions.updateAssetTabScreen({ catAssetTabKey: key }));
          }}
        />
      </Row>

      {tabItems[tabKey] ? tabItems[tabKey].children : null}
    </Column>
  );
}
