import { useEffect, useState } from 'react';

import { SignDataApprovalParams } from '@/shared/types/Approval';
import { Button, Card, Column, Content, Footer, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { copyToClipboard, useApproval, useWallet } from '@/ui/utils';

export interface Props {
    params: SignDataApprovalParams;
}

const AGREEMENT_TEXT = 'I only sign what I understand';
export default function SignData({ params: { data, session } }: Props) {
    const [getApproval, resolveApproval, rejectApproval] = useApproval();

    const handleCancel = () => {
        void rejectApproval();
    };

    const handleConfirm = () => {
        void resolveApproval();
    };

    const wallet = useWallet();
    const [ready, setReady] = useState(false);
    const [enableSignData, setEnableSignData] = useState(false);
    useEffect(() => {
        wallet
            .getEnableSignData()
            .then((enable) => {
                setEnableSignData(enable);
            })
            .finally(() => {
                setReady(true);
            });
    }, []);

    const tools = useTools();

    const [inputValue, setInputValue] = useState('');
    const [understand, setUnderstand] = useState(false);
    useEffect(() => {
        if (inputValue === AGREEMENT_TEXT) {
            setUnderstand(true);
        } else {
            setUnderstand(false);
        }
    }, [inputValue]);

    if (!ready) {
        return (
            <Layout>
                <Loading />
            </Layout>
        );
    }

    if (!enableSignData) {
        return (
            <Layout>
                <Content>
                    <Header>
                        <WebsiteBar session={session} />
                    </Header>

                    <Column>
                        <Text text="Sign Data request" preset="title-bold" textCenter mt="lg" />

                        <Text
                            text={
                                'You need to enable the signData request feature in Settings -> Advanced to continue.'
                            }
                            textCenter
                        />
                    </Column>
                </Content>

                <Footer>
                    <Row full>
                        <Button text="Reject" full preset="default" onClick={handleCancel} />
                    </Row>
                </Footer>
            </Layout>
        );
    }

    return (
        <Layout>
            <Content>
                <Header>
                    <WebsiteBar session={session} />
                </Header>

                <Column>
                    <Text text="Signature request" preset="title-bold" textCenter mt="lg" />

                    <Text text="You are signing data:" textCenter mt="lg" />

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
                            {data.data}
                        </div>
                    </Card>

                    <Text
                        preset="sub"
                        textCenter
                        mt="lg"
                        color="warning"
                        text={
                            'Only sign this message if you fully understand the content and trust the requesting site. Or you could be agreeing to give away your funds and NFTs.'
                        }
                    />
                    <Row
                        itemsCenter
                        gap="sm"
                        onClick={() => {
                            copyToClipboard(AGREEMENT_TEXT).then(() => {
                                tools.toastSuccess('Copied');
                            });
                        }}>
                        <Text text={`Enter “${AGREEMENT_TEXT}” to continue`} preset="bold" />
                        <Icon icon="copy" color="textDim" />
                    </Row>
                    <Input
                        preset="text"
                        autoFocus={true}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                    />
                </Column>
            </Content>

            <Footer>
                <Row full>
                    <Button text="Reject" full preset="default" onClick={handleCancel} />
                    <Button text="Sign" full preset="primary" onClick={handleConfirm} disabled={!understand} />
                </Row>
            </Footer>
        </Layout>
    );
}
