import { decodeCallData, Decoded, selectorToString } from '@/shared/web3/decoder/CalldataDecoder';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { DetailedInteractionParameters } from '@/shared/web3/interfaces/DetailedInteractionParameters';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import InteractionHeader from '@/ui/pages/Approval/components/Headers/InteractionHeader';
import { DecodedCalldata } from '@/ui/pages/OpNet/decoded/DecodedCalldata';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useApproval } from '@/ui/utils/hooks';

interface Props {
  params: {
    data: DetailedInteractionParameters;
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function SignText(props: Props) {
  const {
    params: { data, session }
  } = props;

  const to: string = data.interactionParameters.to;
  const [_, resolveApproval, rejectApproval] = useApproval();
  const account = useCurrentAccount();

  const handleCancel = async () => {
    await rejectApproval('User rejected the request.');
  };

  const handleConfirm = async () => {
    await resolveApproval();
  };

  const contractInfo: ContractInformation = data.contractInfo;
  const interactionType = selectorToString(data.interactionParameters.calldata as unknown as string);
  const decoded: Decoded | null = decodeCallData(data.interactionParameters.calldata as unknown as string);

  return (
    <Layout>
      <Content>
        <Header padding={8} height={'140px'}>
          <Column>
            <WebsiteBar session={session} />
            <InteractionHeader session={session} contract={to} contractInfo={data.contractInfo} />
          </Column>
        </Header>
        <Column>
          <Text text="Decoded:" textCenter mt="lg" preset={'sub-bold'} />
          {decoded ? (
            <DecodedCalldata
              decoded={decoded}
              contractInfo={contractInfo}
              interactionType={interactionType}></DecodedCalldata>
          ) : (
            <Card>
              <Text text={interactionType} textCenter mt="lg" />
            </Card>
          )}
          <Text text="Calldata:" textCenter mt="lg" preset={'sub-bold'} />
          <Card>
            <div
              style={{
                userSelect: 'text',
                maxHeight: 384,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                flexWrap: 'wrap',
                fontSize: 12
              }}>
              {`0x${data.interactionParameters.calldata}`}
            </div>
          </Card>
          <Text
            text="Only sign this transaction if you fully understand the content and trust the requesting site."
            preset="sub"
            textCenter
            mt="lg"
          />
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
