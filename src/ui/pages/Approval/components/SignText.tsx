import { Button, Layout } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';

import WebsiteBar from '@/ui/components/WebsiteBar';
import { useApproval } from '@/ui/utils';

interface Props {
  params: {
    data: {
      text: string;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}
export default function SignText({ params: { data, session } }: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const handleCancel = () => {
    rejectApproval();
  };

  const handleConfirm = () => {
    resolveApproval();
  };
  return (
    <Layout className="h-full">
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          <WebsiteBar session={session} />

          <div className="flex flex-col px-2 text-2xl font-semibold h-13 text-center mt-5">Signature request</div>
          <div className="flex flex-col px-10  text-soft-white  h-13 text-center mt-5">
            Only sign this message if you fully understand the content and trust the requesting site.
          </div>
          <div className="flex flex-col px-2  h-13 text-center mt-5">You are signing:</div>
          <div
            className=" flex-wrap break-words whitespace-pre-wrap bg-slate-300 bg-opacity-5 p-5 max-h-96 overflow-auto"
            style={{ userSelect: 'text' }}>
            {data.text}
          </div>
        </div>
      </Content>

      <Footer className="footer-bar flex-col">
        <div className="grid grid-cols-2 gap-x-2.5 mx-5">
          <Button size="large" type="default" className="box" onClick={handleCancel}>
            <div className="flex flex-col items-center text-lg font-semibold">Reject</div>
          </Button>
          <Button size="large" type="primary" className="box" onClick={handleConfirm}>
            <div className="flex  flex-col items-center text-lg font-semibold">Sign</div>
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}
