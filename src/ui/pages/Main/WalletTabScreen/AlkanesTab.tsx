import { useMemo } from 'react';

import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { AlkanesAssetTabKey, uiActions, useAlkanesAssetTabKey, useAppDispatch, useI18n } from '@unisat/wallet-state';

import { AlkanesCollectionList } from './AlkanesCollectionList';
import { AlkanesList } from './AlkanesList';

export function AlkanesTab() {
  const tabKey = useAlkanesAssetTabKey();

  const dispatch = useAppDispatch();

  const { t } = useI18n();
  const tabItems = useMemo(() => {
    const items = [
      {
        key: AlkanesAssetTabKey.TOKEN,
        label: t('tokens'),
        children: <AlkanesList />
      },
      {
        key: AlkanesAssetTabKey.COLLECTION,
        label: t('collections'),
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
