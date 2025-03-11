import { Button, Card, Column, Content, Header, Layout } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

const UPGRADE_NOTICE = '...';
export default function UpgradeNoticeScreen() {
  const { t } = useI18n();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('notice')}
      />
      <Content>
        <Column>
          <Card>
            <div
              style={{
                userSelect: 'text',
                maxHeight: 384,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                flexWrap: 'wrap'
              }}>
              {UPGRADE_NOTICE}
            </div>
          </Card>
          <Button
            text={t('ok')}
            preset="danger"
            onClick={async () => {
              window.history.go(-1);
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
