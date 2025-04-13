import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { makeADR36AminoSignDoc, serializeSignDoc } from '@/background/service/keyring/CosmosKeyring';
import { CosmosSignDataType } from '@/shared/types';
import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';

import CosmosSignScreen from '../Wallet/CosmosSignScreen';

export default function CosmosSignDemo() {
  const [showSignScreen, setShowSignScreen] = useState(false);
  const [signResult, setSignResult] = useState<any>(null);
  const tools = useTools();
  const navigate = useNavigate();

  const signerAddress = 'bbn...';
  const signDoc = makeADR36AminoSignDoc(signerAddress, 'hello');
  const toSignData = serializeSignDoc(signDoc);

  const cosmosSignRequest = {
    signData: toSignData,
    dataType: CosmosSignDataType.COSMOS_AMINO,
    path: "m/84'/0'/0'/0/0",
    chainId: 'bbn-test-5',
    accountNumber: '0',
    address: signerAddress
  };

  const handleSuccess = useCallback((data: any) => {
    setSignResult(data);
    setShowSignScreen(false);
    tools.toastSuccess('Cosmos Sign Success');
  }, []);

  const handleBack = useCallback(() => {
    setShowSignScreen(false);
    navigate(-1);
  }, [navigate]);

  return (
    <Layout>
      <Header title="Cosmos Signature Demo" />
      <Content>
        {!showSignScreen ? (
          <Column gap="lg" style={{ padding: 16 }}>
            <Text text="This is a Cosmos signature demo page" preset="title" textCenter />
            <Text text="Click the button below to start the signature process" preset="sub" textCenter />
            <Text text={'The message "hello" will be signed'} preset="sub" textCenter />
            <Text text={`Signing address: ${signerAddress}`} preset="sub" textCenter />

            <Button text="START COSMOS SIGN" preset="primary" onClick={() => setShowSignScreen(true)} />

            {signResult && (
              <Column gap="md" style={{ marginTop: 20 }}>
                <Text text="SIGN RESULT:" preset="bold" />
                <div
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    maxHeight: 200,
                    overflow: 'auto',
                    wordBreak: 'break-all'
                  }}>
                  <pre>{JSON.stringify(signResult, null, 2)}</pre>
                </div>
              </Column>
            )}
          </Column>
        ) : (
          <CosmosSignScreen cosmosSignRequest={cosmosSignRequest} onSuccess={handleSuccess} onBack={handleBack} />
        )}
      </Content>
      {!showSignScreen && (
        <Footer>
          <Row full>
            <Button text="BACK" preset="default" full onClick={handleBack} />
          </Row>
        </Footer>
      )}
    </Layout>
  );
}
