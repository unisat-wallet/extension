import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';

const UPGRADE_NOTICE = '...';
export default function UpgradeNoticeScreen() {
  const { t } = useTranslation();
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Notice"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech gap-3_75 justify-evenly mx-5">
          <div
            className=" flex-wrap break-words whitespace-pre-wrap bg-slate-300 bg-opacity-5 p-5 overflow-auto"
            style={{ userSelect: 'text' }}>
            {UPGRADE_NOTICE}
          </div>
          <div className="grid w-full grid-cols-1 gap-2_5 my-2">
            <div
              className="cursor-pointer box unit ant-btn-dangerous hover:border-white hover:border-opacity-40"
              onClick={async () => {
                window.history.go(-1);
              }}>
              OK
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
