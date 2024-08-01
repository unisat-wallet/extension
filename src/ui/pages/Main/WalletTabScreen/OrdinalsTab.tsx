import { Column, Row } from '@/ui/components';
import { TabBar } from '@/ui/components/TabBar';
import { useAddressSummary } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useOrdinalsAssetTabKey } from '@/ui/state/ui/hooks';
import { OrdinalsAssetTabKey, uiActions } from '@/ui/state/ui/reducer';

import { BRC20List5Byte } from './BRC20List5Byte';
import { BRC20List } from './Brc20List';
import { InscriptionList } from './InscriptionList';

export function OrdinalsTab() {
    const addressSummary = useAddressSummary();
    const tabItems = [
        {
            key: OrdinalsAssetTabKey.ALL,
            label: `ALL (${addressSummary.inscriptionCount})`,
            children: <InscriptionList />
        },
        {
            key: OrdinalsAssetTabKey.BRC20,
            label: `BRC-20 (${addressSummary.brc20Count})`,
            children: <BRC20List />
        },
        {
            key: OrdinalsAssetTabKey.BRC20_5BYTE,
            label: `BRC-20[5-byte] (${addressSummary.brc20Count5Byte || 0})`,
            children: <BRC20List5Byte />
        }
    ];

    const tabKey = useOrdinalsAssetTabKey();
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
                        dispatch(uiActions.updateAssetTabScreen({ ordinalsAssetTabKey: key }));
                    }}
                />
            </Row>

            {tabItems[tabKey].children}
        </Column>
    );
}
