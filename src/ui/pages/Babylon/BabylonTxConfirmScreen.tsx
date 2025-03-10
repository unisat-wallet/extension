import { useState } from 'react';

import { COSMOS_CHAINS_MAP } from '@/shared/constant/cosmosChain';
import { BabylonTxInfo, CosmosSignDataType } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import { useAccountAddress, useCurrentAccount, useIsKeystoneWallet } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useBabylonConfig } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { useLocationState, useWallet } from '@/ui/utils';

import CosmosSignScreen from '../Wallet/CosmosSignScreen';

interface LocationState {
  txInfo: BabylonTxInfo;
}

function Section({ title, children, extra }: { title: string; children?: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <Column>
      <Row justifyBetween>
        <Text text={title} preset="bold" />
        {extra}
      </Row>
      <Card>
        <Row full justifyBetween itemsCenter>
          {children}
        </Row>
      </Card>
    </Column>
  );
}

export default function BabylonTxConfirmScreen() {
  const { txInfo } = useLocationState<LocationState>();
  const wallet = useWallet();

  const [result, setResult] = useState<{
    result: 'success' | 'failed';
    txid?: string;
    error?: string;
  } | null>(null);

  const tools = useTools();

  const babylonConfig = useBabylonConfig();

  const babylonChain = COSMOS_CHAINS_MAP[babylonConfig.chainId];

  const [isCosmosSignScreenOpen, setIsCosmosSignScreenOpen] = useState(false);
  const [cosmosSignRequest, setCosmosSignRequest] = useState<{
    requestId?: string;
    signData: any;
    dataType: CosmosSignDataType;
    path: string;
    chainId?: string;
    accountNumber?: string;
    address?: string;
  } | null>(null);

  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const address = useAccountAddress();
  const isKeystone = useIsKeystoneWallet();

  if (isCosmosSignScreenOpen && cosmosSignRequest) {
    return (
      <CosmosSignScreen
        cosmosSignRequest={cosmosSignRequest}
        onSuccess={async (signResult) => {
          tools.showLoading(true);
          try {
            const txid = await wallet.createSendTokenStep2(babylonChain.chainId, signResult.signature);
            setResult({ result: 'success', txid });
          } catch (error) {
            setResult({ result: 'failed', error: (error as any).message || 'Failed to handle signature' });
          } finally {
            setIsCosmosSignScreenOpen(false);
            tools.showLoading(false);
          }
        }}
        onBack={() => {
          setIsCosmosSignScreenOpen(false);
        }}
      />
    );
  }

  if (result && result.result === 'success') {
    return (
      <Layout>
        <Header />

        <Content style={{ gap: spacing.small }}>
          <Column justifyCenter mt="xxl" gap="xl">
            <Row justifyCenter>
              <Icon icon="success" size={50} style={{ alignSelf: 'center' }} />
            </Row>

            <Text preset="title" text="Payment Sent" textCenter />
            <Text preset="sub" text="Your transaction has been successfully sent" color="textDim" textCenter />

            {babylonChain.explorer ? (
              <Row
                justifyCenter
                onClick={() => {
                  window.open(`${babylonChain.explorer}/transaction/${result.txid}`, '_blank');
                }}>
                <Icon icon="eye" color="textDim" />
                <Text preset="regular-bold" text="View on Block Explorer" color="textDim" />
              </Row>
            ) : null}
          </Column>
        </Content>
        <Footer>
          <Button
            full
            text="Done"
            onClick={() => {
              window.history.go(-2);
            }}
          />
        </Footer>
      </Layout>
    );
  } else if (result && result.result === 'failed') {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
        />
        <Content>
          <Column justifyCenter mt="xxl" gap="xl">
            <Row justifyCenter>
              <Icon icon="delete" size={50} />
            </Row>

            <Text preset="title" text="Payment Failed" textCenter />
            <Text preset="sub" style={{ color: colors.red }} text={result.error} textCenter />
          </Column>
        </Content>
      </Layout>
    );
  }

  const handleSignAndPay = async () => {
    tools.showLoading(true);
    try {
      const signDataBytesHex = await wallet.createSendTokenStep1(
        babylonConfig.chainId,
        txInfo.unitBalance,
        txInfo.toAddress,
        txInfo.memo || ''
      );

      if (isKeystone) {
        setCosmosSignRequest({
          signData: signDataBytesHex,
          dataType: CosmosSignDataType.COSMOS_DIRECT,
          path: currentKeyring.hdPath + '/' + currentAccount.index,
          chainId: babylonChain.chainId,
          address
        });
        tools.showLoading(false);
        setIsCosmosSignScreenOpen(true);
      } else {
        try {
          const result = await wallet.cosmosSignData(babylonConfig.chainId, signDataBytesHex);
          const txid = await wallet.createSendTokenStep2(babylonChain.chainId, result.signature);
          setResult({ result: 'success', txid: txid });
        } catch (e) {
          setResult({ result: 'failed', error: (e as any).message });
        } finally {
          tools.showLoading(false);
        }
      }
    } catch (e) {
      setResult({ result: 'failed', error: (e as any).message });
      tools.showLoading(false);
    }
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Column gap="lg" style={{ position: 'relative' }}>
          <Row itemsCenter justifyCenter fullX py={'sm'}>
            <Text text="Sign Transaction" preset="title-bold" textCenter />
          </Row>
          <Row justifyCenter>
            <Card style={{ backgroundColor: '#272626', flex: '1' }}>
              <Column fullX itemsCenter>
                <Row itemsCenter justifyCenter>
                  <Image src={'./images/icons/baby.svg'} size={24} />
                  <Text text={'tBABY'} />
                </Row>
                <Row
                  style={{ borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignSelf: 'stretch' }}
                  my="md"
                />
                <Column>
                  <Text text={'Send to'} textCenter color="textDim" />
                  <Row justifyCenter>
                    <AddressText
                      addressInfo={{
                        address: txInfo.toAddress
                      }}
                      textCenter
                    />
                  </Row>
                </Column>

                <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

                <Column>
                  <Text text={'Send Amount'} textCenter color="textDim" />

                  <Column justifyCenter>
                    <Row itemsCenter>
                      <Text
                        text={`${txInfo.balance.amount} ${txInfo.balance.denom}`}
                        color="white"
                        preset="bold"
                        textCenter
                        size="xxl"
                      />
                    </Row>
                  </Column>
                </Column>
              </Column>
            </Card>
          </Row>
        </Column>

        {txInfo.memo ? (
          <Section title="Memo:">
            <Row>
              <Text text={txInfo.memo} wrap />
            </Row>
          </Section>
        ) : null}

        <Section title="Tx Fee:">
          <Text text={txInfo.txFee.amount} color="white" />
          <Text text={txInfo.txFee.denom} color="textDim" />
        </Section>
      </Content>

      <Footer>
        <Row full>
          <Button
            preset="default"
            text="Reject"
            onClick={() => {
              window.history.go(-1);
            }}
            full
          />
          <Button
            preset="primary"
            text={'Sign & Pay'}
            onClick={async () => {
              handleSignAndPay();
            }}
            full
          />
        </Row>
      </Footer>
    </Layout>
  );
}
