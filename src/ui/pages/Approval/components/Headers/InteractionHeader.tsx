
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

interface Props {
    readonly session: { origin: string; icon: string; name: string };

    readonly contract: string;
    readonly contractInfo?: ContractInformation;
}

const InteractionHeader = (props: Props) => {
    const contractInfo = props.contractInfo;
    const contract = props.contract;

    return (
        <Column>
            <Text
                text={`Interacting with: ${contractInfo?.name !== undefined ? contractInfo.name : 'Generic Contract'}`}
                textCenter
                preset="title-bold"
                mt="lg"
            />
            <Card preset="style2" selfItemsCenter>
                <Row itemsCenter>
                    {contractInfo?.logo ? (
                        <Image src={contractInfo.logo} size={fontSizes.logo} />
                    ) : undefined}

                    <div
                        style={{
                            textOverflow: 'ellipsis',
                            userSelect: 'text',
                            maxHeight: 384,
                            maxWidth: 254,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            flexWrap: 'wrap',
                            fontSize: 16
                        }}>
                        {contract}
                    </div>
                </Row>
            </Card>
        </Column>
    );
};

export default InteractionHeader;
