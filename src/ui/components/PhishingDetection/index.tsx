import { Button, Column, Content, Footer, Layout, Row, Text } from '@/ui/components';

export function PhishingDetection({ handleCancel }: { handleCancel: () => void }) {
  return (
    <Layout>
      <Content>
        <Column>
          <Text text="Phishing Detection" preset="title-bold" textCenter mt="xxl" />
          <Text text="Malicious behavior and suspicious activity have been detected." mt="md" />
          <Text text="Your access to this page has been restricted by UniSat Wallet as it might be unsafe." mt="md" />
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text="Reject (blocked by UniSat Wallet)" preset="danger" onClick={handleCancel} full />
        </Row>
      </Footer>
    </Layout>
  );
}
