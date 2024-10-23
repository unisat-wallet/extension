import { Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { useLocationState } from '@/ui/utils';

export default function TxFailScreen() {
    const { error } = useLocationState<{ error: string }>();
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
            />
            <Content>
                <Column justifyCenter mt="xxl" gap="xl">
                    <Row justifyCenter>
                        <Icon icon="delete" size={50} />
                    </Row>

                    <Text preset="title" text="Payment Failed" textCenter />
                    {error.split('\n').map((line, index) => {
                        return (
                            <Text
                                key={index}
                                preset="regular-bold"
                                style={{
                                    color: colors.red,
                                    backgroundColor: 'rgba(225, 45, 53, 0.1)',
                                    padding: 5,
                                    borderRadius: 7
                                }}
                                text={line}
                                textCenter
                            />
                        );
                    })}
                </Column>
            </Content>
        </Layout>
    );
}
