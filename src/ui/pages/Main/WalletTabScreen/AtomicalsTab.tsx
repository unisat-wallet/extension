import { Column, Row } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { TabBar } from '@/ui/components/TabBar';
import { useAddressSummary } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useAtomicalsAssetTabKey } from '@/ui/state/ui/hooks';
import { AtomicalsAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { Arc20List } from './Arc20List';
import { AtomicalList } from './AtomicalsList';

export function AtomicalsTab() {
  const addressSummary = useAddressSummary();
  const tabItems = [
    {
      key: AtomicalsAssetTabKey.ALL,
      label: `ALL (${addressSummary.atomicalsCount})`,
      children: <AtomicalList />,
      hidden: true
    },
    {
      key: AtomicalsAssetTabKey.ARC20,
      label: `ARC-20 (${addressSummary.arc20Count})`,
      children: <Arc20List />
    },
    {
      key: AtomicalsAssetTabKey.OTHERS,
      label: `Others`,
      children: (
        <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
          <Empty text="Not supported yet" />
        </Column>
      )
    }
  ];

  const tabKey = useAtomicalsAssetTabKey();
  const dispatch = useAppDispatch();

  return (
    <Column>
      <Row justifyBetween>
        <TabBar
          defaultActiveKey={tabKey}
          activeKey={tabKey}
          items={tabItems}
          preset="style2"
          onTabClick={(key) => {
            dispatch(uiActions.updateAssetTabScreen({ atomicalsAssetTabKey: key }));
          }}
        />
      </Row>

      {tabItems[tabKey].children}
    </Column>
  );
}
