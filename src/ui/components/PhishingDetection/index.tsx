import { Button, Column, Content, Footer, Layout, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

export function PhishingDetection({ handleCancel }: { handleCancel: () => void }) {
  const { t } = useI18n();
  return (
    <Layout>
      <Content>
        <Column>
          <Text text={t('phishing_detection')} preset="title-bold" textCenter mt="xxl" />
          <Text text={t('malicious_behavior_and_suspicious_activity_have_be')} mt="md" />
          <Text text={t('your_access_to_this_page_has_been_restricted_by_un')} mt="md" />
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text={t('reject_blocked_by_unisat_wallet')} preset="danger" onClick={handleCancel} full />
        </Row>
      </Footer>
    </Layout>
  );
}
