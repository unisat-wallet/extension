import { useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { ColdWalletSignMessage } from '@/ui/components/ColdWallet';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useApproval } from '@/ui/utils';
import { KeystoneSignEnum } from '@unisat/keyring-service';

import KeystoneSignScreen from '../../Wallet/KeystoneSignScreen';

interface Props {
  params: {
    data: {
      text: string;
      type: string;
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
  const account = useCurrentAccount();
  const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);
  const { t } = useI18n();

  const handleCancel = () => {
    rejectApproval();
  };

  const handleConfirm = () => {
    if (account.type === KEYRING_TYPE.KeystoneKeyring) {
      setIsKeystoneSigning(true);
      return;
    }
    resolveApproval();
  };

  // Handle cold wallet signing
  if (account.type === KEYRING_TYPE.ColdWalletKeyring) {
    return (
      <ColdWalletSignMessage
        messages={[{ text: data.text, type: data.type }]}
        onSuccess={(signatures: string[]) => {
          resolveApproval({ signature: signatures[0] });
        }}
        onCancel={() => {
          rejectApproval('User canceled');
        }}
        header={
          <Header>
            <WebsiteBar session={session} />
          </Header>
        }
        origin={session?.origin}
      />
    );
  }

  if (isKeystoneSigning) {
    return (
      <KeystoneSignScreen
        type={data.type === KeystoneSignEnum.BIP322_SIMPLE ? KeystoneSignEnum.BIP322_SIMPLE : KeystoneSignEnum.MSG}
        data={data.text}
        onSuccess={({ signature }) => {
          resolveApproval({ signature });
        }}
        onBack={() => {
          setIsKeystoneSigning(false);
        }}
      />
    );
  }
  return (
    <Layout>
      <Content>
        <Header>
          <WebsiteBar session={session} />
        </Header>
        <Column>
          <Text text={t('signature_request')} preset="title-bold" textCenter mt="lg" />
          <Text text={t('only_sign_this_message_if_you_fully_understand_the')} preset="sub" textCenter mt="lg" />
          <Text text={t('you_are_signing')} textCenter mt="lg" />

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
              {data.text}
            </div>
          </Card>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text={t('reject')} full preset="default" onClick={handleCancel} />
          <Button text={t('sign')} full preset="primary" onClick={handleConfirm} />
        </Row>
      </Footer>
    </Layout>
  );
}
