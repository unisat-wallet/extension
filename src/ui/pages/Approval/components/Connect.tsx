import VirtualList from 'rc-virtual-list';
import { forwardRef } from 'react';

import { Account } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccounts, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { shortAddress, useApproval, useWallet } from '@/ui/utils';
import { CheckCircleFilled } from '@ant-design/icons';

interface MyItemProps {
  account?: Account;
}

export function MyItem({ account }: MyItemProps, ref) {
  const currentAccount = useCurrentAccount();
  const selected = currentAccount.pubkey == account?.pubkey;
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  if (!account) {
    return <div />;
  }

  return (
    <Card
      justifyBetween
      mt="md"
      onClick={async (e) => {
        if (currentAccount.pubkey !== account.pubkey) {
          await wallet.changeAccount(account);
          dispatch(accountActions.setCurrent(account));
        }
      }}>
      <Row>
        <Column style={{ width: 20 }} selfItemsCenter>
          {selected && (
            <Icon>
              <CheckCircleFilled />
            </Icon>
          )}
        </Column>
        <Column>
          <Text text={account.alianName} />
          <Text text={`${shortAddress(account.address)}`} preset="sub" />
        </Column>
      </Row>
      <Column relative></Column>
    </Card>
  );
}

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
      <Header>
        <WebsiteBar session={session} />
      </Header>
      <Content>
        <Column>
          <Text text="Connect with Unisat Wallet" preset="title-bold" textCenter mt="lg" />
          <Text text="Select the account to use on this site" textCenter mt="md" />
          <Text text="Only connect with sites you trust." preset="sub" textCenter mt="md" />

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
