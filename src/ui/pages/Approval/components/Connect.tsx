import VirtualList from 'rc-virtual-list';
import { forwardRef } from 'react';

import { Button, Column, Content, Footer, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccounts } from '@/ui/state/accounts/hooks';
import { useApproval } from '@/ui/utils';

import { MyItem } from '../../Account/SwitchAccountScreen';

interface Props {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function Connect({ params: { session } }: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleConnect = async () => {
    resolveApproval();
  };

  const accounts = useAccounts();
  const items = accounts.map((v) => ({
    key: v.address,
    account: v
  }));
  const ForwardMyItem = forwardRef(MyItem);

  return (
    <Layout>
      <Content>
        <Column mt="lg">
          <WebsiteBar session={session} />

          <Text text="Connect with Unisat Wallet" preset="title-bold" textCenter mt="lg" />
          <Text text="Select the account to use on this site" textCenter mt="lg" />
          <Text text="Only connect with sites you trust." preset="sub" textCenter mt="lg" />

          <VirtualList
            data={items}
            data-id="list"
            itemHeight={20}
            itemKey={(item) => item.key}
            // disabled={animating}
            style={{
              boxSizing: 'border-box'
            }}
            // onSkipRender={onAppear}
            // onItemRemove={onAppear}
          >
            {(item, index) => <ForwardMyItem account={item.account} />}
          </VirtualList>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text="Cancel" preset="default" onClick={handleCancel} full />
          <Button text="Connect" preset="primary" onClick={handleConnect} full />
        </Row>
      </Footer>
    </Layout>
  );
}
