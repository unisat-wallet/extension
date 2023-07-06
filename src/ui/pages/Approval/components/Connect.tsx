import VirtualList from 'rc-virtual-list';
import { forwardRef } from 'react';

import { Account } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccounts, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { shortAddress, useApproval, useWallet } from '@/ui/utils';
import { CheckCircleFilled } from '@ant-design/icons';

interface MyItemProps {
  account?: Account;
  selected?: boolean;
  onClick?: () => void;
}

export function MyItem({ account, selected, onClick }: MyItemProps, ref) {
  if (!account) {
    return <div />;
  }

  return (
    <Card justifyBetween mt="sm" onClick={onClick}>
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

  const keyrings = useKeyrings();
  const wallet = useWallet();

  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();

  const dispatch = useAppDispatch();

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

          {keyrings.map((keyring) => (
            <Column mt="lg" key={keyring.key}>
              <Text text={keyring.alianName} preset="sub" />
              {keyring.accounts.map((account) => (
                <MyItem
                  key={account.key}
                  account={account}
                  selected={currentKeyring.key === keyring.key && currentAccount.address === account.address}
                  onClick={async () => {
                    const accountIndex = account.index || 0;
                    await wallet.changeKeyring(keyring, accountIndex);
                    dispatch(keyringsActions.setCurrent(keyring));
                    const _currentAccount = await wallet.getCurrentAccount();
                    dispatch(accountActions.setCurrent(_currentAccount));
                  }}
                />
              ))}
            </Column>
          ))}
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
