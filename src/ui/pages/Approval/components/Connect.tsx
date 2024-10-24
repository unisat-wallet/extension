import { useEffect, useState } from 'react';

import { Account, WebsiteState } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { shortAddress, useApproval, useWallet } from '@/ui/utils';
import { CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';

interface MyItemProps {
  account?: Account;
  selected?: boolean;
  onClick?: () => void;
}

export interface ItemData {
  key: string;
  account?: Account;
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
          <Text text={`${shortAddress(account.address, 20)}`} preset="sub" />
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

  const [checkState, setCheckState] = useState(WebsiteState.CHECKING);
  const [warning, setWarning] = useState('');

  const balance = useAccountBalance();

  useEffect(() => {
    wallet.checkWebsite(session.origin).then((v) => {
      if (v.isScammer) {
        setCheckState(WebsiteState.SCAMMER);
      } else {
        setCheckState(WebsiteState.SAFE);
      }
      if (v.warning) {
        setWarning(v.warning);
      }
    });
  }, []);

  if (checkState === WebsiteState.CHECKING) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }

  if (checkState === WebsiteState.SCAMMER) {
    return (
      <Layout>
        <Header>
          <WebsiteBar session={session} />
        </Header>
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

  if (warning) {
    return (
      <Layout>
        <Header>
          <WebsiteBar session={session} />
        </Header>
        <Content>
          <Column>
            <Text text="Warning" preset="title-bold" textCenter mt="xxl" />
            <Text text={warning} mt="md" />
          </Column>
        </Content>

        <Footer>
          <Row full>
            <Button
              text="I am aware of the risks"
              preset="danger"
              onClick={() => {
                setWarning('');
              }}
              full
            />
          </Row>
        </Footer>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header>
        <WebsiteBar session={session} />
      </Header>
      <Content>
        <Column>
          <Text text="Connect with UniSat Wallet" preset="title-bold" textCenter mt="lg" />
          <Text text="Select the account to use on this site" textCenter mt="md" />
          <Text text="Only connect with sites you trust." preset="sub" textCenter mt="md" />

          <Text text={currentKeyring.alianName} preset="sub" />
          <MyItem account={currentAccount} />
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
