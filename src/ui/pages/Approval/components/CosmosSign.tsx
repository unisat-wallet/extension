import { useEffect, useState } from 'react';

import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { useApproval, useWallet } from '@/ui/utils';

interface Props {
  params: {
    data: {
      signerAddress: string;
      signDoc: any;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}
export default function CosmosSign({ params: { data, session } }: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const account = useCurrentAccount();

  const [babylonAddress, setBabylonAddress] = useState('');

  const babylonConfig = useBabylonConfig();
  const babylonChainId = babylonConfig.chainId;
  const wallet = useWallet();
  useEffect(() => {
    wallet.getBabylonAddress(babylonChainId).then((address) => {
      setBabylonAddress(address);
    });
  }, []);

  const handleCancel = () => {
    rejectApproval();
  };

  const handleConfirm = () => {
    resolveApproval();
  };

  return (
    <Layout>
      <Content>
        <Header>
          <WebsiteBar session={session} />
        </Header>
        <Column>
          <Text text="Cosmos Sign request" preset="title-bold" textCenter mt="lg" />

          <Row justifyCenter>
            <Row justifyCenter px="lg" py="sm" style={{ backgroundColor: '#3F3227', borderRadius: 10 }}>
              <CopyableAddress address={babylonAddress} />
            </Row>
          </Row>

          <Text
            text="Only sign if you fully understand the content and trust the requesting site."
            preset="sub"
            textCenter
            mt="lg"
          />
          <Text text="You are signing:" textCenter mt="lg" />

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
              {data.signerAddress}
            </div>
          </Card>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text="Reject" full preset="default" onClick={handleCancel} />
          <Button text="Sign" full preset="primary" onClick={handleConfirm} />
        </Row>
      </Footer>
    </Layout>
  );
}
