import { useEffect, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { KeystoneSignEnum } from '@/shared/constant/KeystoneSignType';
import { objToUint8Array } from '@/shared/utils';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useI18n } from '@/ui/hooks/useI18n';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { useApproval, useWallet } from '@/ui/utils';

interface Props {
  params: {
    data: {
      signerAddress: string;
      signDoc?: any;
      data?: any;
      signBytesHex: string;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
  origin?: string;
  requestDefer?: any;
}

export default function CosmosSign({ params: { data, session }, origin }: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const account = useCurrentAccount();
  const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);
  const { t } = useI18n();

  const isKeystone = account.type === KEYRING_TYPE.KeystoneKeyring;

  const [babylonAddress, setBabylonAddress] = useState('');

  const babylonConfig = useBabylonConfig();
  const babylonChainId = babylonConfig.chainId;
  const wallet = useWallet();

  const keystoneSignType = data.signDoc ? KeystoneSignEnum.COSMOS_DIRECT : KeystoneSignEnum.COSMOS_ARBITRARY;

  useEffect(() => {
    wallet.getBabylonAddress(babylonChainId).then((address) => {
      setBabylonAddress(address);
    });

    // TODO: decode signDoc
    // if (data.signDoc) {
    //   const aminoTypes = new AminoTypes(createDefaultAminoConverters());
    //   const decodedBody = aminoTypes.fromAmino({ type: 'cosmos-sdk/MsgSend', value: data.signDoc });
    // }
  }, []);

  const handleCancel = () => {
    rejectApproval();
  };

  const handleConfirm = async () => {
    if (isKeystone) {
      setIsKeystoneSigning(true);
    } else {
      const result = await wallet.cosmosSignData(babylonChainId, data.signBytesHex);
      resolveApproval(result);
    }
  };

  if (isKeystoneSigning) {
    return (
      <KeystoneSignScreen
        type={keystoneSignType}
        data={data.signBytesHex}
        onSuccess={(result) => {
          resolveApproval(result);
          setIsKeystoneSigning(false);
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
          <Text text={t('cosmos_sign_request')} preset="title-bold" textCenter mt="lg" />

          <Row justifyCenter>
            <Row justifyCenter px="lg" py="sm" style={{ backgroundColor: '#3F3227', borderRadius: 10 }}>
              <CopyableAddress address={babylonAddress} />
            </Row>
          </Row>

          <Text text={t('only_sign_if_you_fully_understand_the_content_and_')} preset="sub" textCenter mt="lg" />
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
              {data.data ||
                (data.signDoc
                  ? JSON.stringify(
                      Object.assign({}, data.signDoc, {
                        bodyBytes: data.signDoc.bodyBytes
                          ? Buffer.from(objToUint8Array(data.signDoc.bodyBytes)).toString('hex')
                          : undefined,
                        authInfoBytes: data.signDoc.authInfoBytes
                          ? Buffer.from(objToUint8Array(data.signDoc.authInfoBytes)).toString('hex')
                          : undefined
                      }),
                      null,
                      2
                    )
                  : '')}
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
