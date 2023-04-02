import { Button, Card, Column, Content, Header, Layout } from '@/ui/components';

const UPGRADE_NOTICE = '...';
export default function UpgradeNoticeScreen() {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Notice"
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
            text="OK"
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
