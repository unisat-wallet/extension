import { SignDeploymentApprovalParams } from '@/shared/types/Approval';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { AddressText } from '@/ui/components/AddressText';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount } from '@/ui/utils';
import { useApproval } from '@/ui/utils/hooks';
import { PsbtTxOutput } from '@btc-vision/bitcoin';


export interface Props {
    params: SignDeploymentApprovalParams;
}

function toHex(buffer: Uint8Array | Buffer | number[]) {
    return Array.prototype.map.call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// TODO (typing): check if we really need this function. We are passing buffer parameter and trying to return Uint8Array
// For now, the lint error is fixed by disabling it. If we no longer need this function, we can remove it completely.
function objToBuffer(obj: object): Uint8Array {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    const buffer = new Uint8Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        buffer[i] = values[i];
    }

    return buffer;
}

export default function SignDeployment(props: Props) {
    const {
        params: { data, session }
    } = props;

    const [_, resolveApproval, rejectApproval] = useApproval();
    const handleCancel = async () => {
        await rejectApproval('User rejected the request.');
    };

    const handleConfirm = async () => {
        await resolveApproval();
    };

    const bytecode: string = typeof data.bytecode === 'string' ? data.bytecode : toHex(objToBuffer(data.bytecode));
    const optionalOutputs: {
        address: string;
        value: number;
    }[] = (data.optionalOutputs ?? []).map((output: PsbtTxOutput) => ({
        address: 'address' in output && output.address ? output.address : '',
        value: output.value
    }));

    const btcUnit = useBTCUnit();
    const currentAccount = useCurrentAccount();

    return (
        <Layout>
            <Content>
                <Header padding={8} height={'140px'}>
                    <Column>
                        <WebsiteBar session={session} />
                        <Column>
                            <Text text={'Deploy contract'} textCenter preset="title-bold" mt="lg" />
                        </Column>
                    </Column>
                </Header>
                <Column>
                    <Text
                        text="You are about to deploy a contract with the following bytecode:"
                        textCenter
                        mt="lg"
                        preset={'sub-bold'}
                    />
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
                            {`0x${bytecode}`}
                        </div>
                    </Card>
                    <Text
                        text="Only sign this transaction if you fully understand the content and trust the requesting site."
                        preset="sub"
                        textCenter
                        mt="lg"
                    />
                </Column>

                {optionalOutputs.length > 0 && (
                    <Column>
                        <Text text={`Outputs: (${optionalOutputs.length})`} preset="bold" />
                        <Card>
                            <Column full justifyCenter gap="lg">
                                {optionalOutputs.map((v, index) => {
                                    const isMyAddress = v.address == currentAccount.address;

                                    return (
                                        <Column
                                            key={`output_${index}`}
                                            style={
                                                index === 0
                                                    ? {}
                                                    : {
                                                        borderColor: colors.border,
                                                        borderTopWidth: 1,
                                                        paddingTop: 10
                                                    }
                                            }>
                                            <Column>
                                                <Row justifyBetween>
                                                    <AddressText
                                                        address={v.address}
                                                        color={isMyAddress ? 'white' : 'textDim'}
                                                    />
                                                    <Row>
                                                        <Text
                                                            text={satoshisToAmount(v.value)}
                                                            color={isMyAddress ? 'white' : 'textDim'}
                                                        />
                                                        <Text text={btcUnit} color="textDim" />
                                                    </Row>
                                                </Row>
                                            </Column>
                                        </Column>
                                    );
                                })}
                            </Column>
                        </Card>
                    </Column>
                )}
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
