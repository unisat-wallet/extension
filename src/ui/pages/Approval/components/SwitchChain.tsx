import { CHAINS_MAP } from '@/shared/constant';
import { SwitchChainApprovalParams } from '@/shared/types/Approval';
import { Button, Card, Column, Content, Footer, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useChainType } from '@/ui/state/settings/hooks';
import { useApproval } from '@/ui/utils';

export interface Props {
    params: SwitchChainApprovalParams;
}

export default function SwitchChain({ params: { data, session } }: Props) {
    const chainType = useChainType();
    const from = CHAINS_MAP[chainType];
    const to = CHAINS_MAP[data.chain];

    const [getApproval, resolveApproval, rejectApproval] = useApproval();

    const handleCancel = async () => {
        await rejectApproval('User rejected the request.');
    };

    const handleConnect = async () => {
        await resolveApproval();
    };

    return (
        <Layout>
            <Header>
                <WebsiteBar session={session} />
            </Header>
            <Content>
                <Column mt="lg">
                    <Text text="Allow this site to switch the chain?" textCenter preset="title-bold" mt="lg" />

                    <Column justifyBetween itemsCenter mt="lg">
                        <Card
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 10
                            }}
                            mt="lg">
                            <Row fullX>
                                <Row itemsCenter>
                                    <Image src={from.icon} size={30} />
                                    <Text text={from.label} />
                                </Row>
                            </Row>
                        </Card>

                        <Icon icon="down" />
                        <Card
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 10
                            }}
                            mt="lg">
                            <Row fullX>
                                <Row itemsCenter>
                                    <Image src={to.icon} size={30} />
                                    <Text text={to.label} />
                                </Row>
                            </Row>
                        </Card>
                    </Column>
                </Column>
            </Content>

            <Footer>
                <Row full>
                    <Button text="Cancel" preset="default" onClick={handleCancel} full />
                    <Button text="Switch Chain" preset="primary" onClick={handleConnect} full />
                </Row>
            </Footer>
        </Layout>
    );
}
