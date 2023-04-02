import { Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';

export default function TxFailScreen() {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Column mt="lg" gap="lg">
          <Row justifyCenter>
            <Icon icon="delete" size={50} />
          </Row>

          <Text preset="title" text="Payment Failed" textCenter />
          <Text
            preset="sub"
            style={{ color: colors.red }}
            text="Your transaction has not succesfully sent"
            textCenter
          />
        </Column>
      </Content>
    </Layout>
  );
}
