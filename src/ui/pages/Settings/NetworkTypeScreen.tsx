import { CHAINS } from '@/shared/constant';
import { Card, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useReloadAccounts } from '@/ui/state/accounts/hooks';
import { useChainType, useChangeChainTypeCallback } from '@/ui/state/settings/hooks';

import { useNavigate } from '../MainRoute';

export default function NetworkTypeScreen() {
    const chainType = useChainType();
    const changeChainType = useChangeChainTypeCallback();
    const reloadAccounts = useReloadAccounts();
    const tools = useTools();
    const navigate = useNavigate();
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Select Network"
            />
            <Content>
                <Column>
                    {CHAINS.map((item, index) => {
                        return (
                            <Card
                                key={index}
                                onClick={async () => {
                                    if (item.enum == chainType) {
                                        return;
                                    }
                                    await changeChainType(item.enum);
                                    reloadAccounts();
                                    navigate('MainScreen');
                                    tools.toastSuccess(`Changed to ${item.label}`);
                                }}>
                                <Row full justifyBetween itemsCenter>
                                    <Row itemsCenter>
                                        <Image src={item.icon} size={30} />
                                        <Text text={item.label} preset="regular-bold" />
                                    </Row>
                                    <Column>{item.enum == chainType && <Icon icon="check" />}</Column>
                                </Row>
                            </Card>
                        );
                    })}
                </Column>
            </Content>
        </Layout>
    );
}
