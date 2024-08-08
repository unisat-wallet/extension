import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useEffect, useState } from 'react';

import { Button, Card, Column, Grid, Icon, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useWallet } from '@/ui/utils';

export function Step1_Create({
    contextData,
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    const [checked, setChecked] = useState(false);

    const wallet = useWallet();
    const tools = useTools();

    const init = async () => {
        const _mnemonics = await wallet.generatePreMnemonic();
        updateContextData({
            mnemonics: _mnemonics
        });
    };

    useEffect(() => {
        init();
    }, []);

    const onChange = (e: CheckboxChangeEvent) => {
        const val = e.target.checked;
        setChecked(val);
        updateContextData({ step1Completed: val });
    };

    function copy(str: string) {
        copyToClipboard(str).then(() => {
            tools.toastSuccess('Copied');
        });
    }

    const btnClick = () => {
        updateContextData({
            tabType: TabType.STEP2
        });
    };

    const words = contextData.mnemonics.split(' ');
    return (
        <Column gap="xl">
            <Text text="Secret Recovery Phrase" preset="title-bold" textCenter />
            <Text
                text="This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!"
                color="warning"
                textCenter
            />

            <Row
                justifyCenter
                onClick={(e) => {
                    copy(contextData.mnemonics);
                }}>
                <Icon icon="copy" color="textDim" />
                <Text text="Copy to clipboard" color="textDim" />
            </Row>

            <Row justifyCenter>
                <Grid columns={2}>
                    {words.map((v, index) => {
                        return (
                            <Row key={index}>
                                <Text text={`${index + 1}. `} style={{ width: 40 }} />
                                <Card preset="style2" style={{ width: 200 }}>
                                    <Text text={v} selectText disableTranslate />
                                </Card>
                            </Row>
                        );
                    })}
                </Grid>
            </Row>

            <Row justifyCenter>
                <Checkbox onChange={onChange} checked={checked} style={{ fontSize: fontSizes.sm }}>
                    <Text text="I saved My Secret Recovery Phrase" />
                </Checkbox>
            </Row>

            <FooterButtonContainer>
                <Button disabled={!checked} text="Continue" preset="primary" onClick={btnClick} />
            </FooterButtonContainer>
        </Column>
    );
}
