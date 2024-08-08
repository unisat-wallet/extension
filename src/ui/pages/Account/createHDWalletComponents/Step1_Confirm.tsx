import { useState } from 'react';

import { Button, Card, Column, Grid, Row, Text } from '@/ui/components';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';

export function Step1_Confirm({
    contextData,
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    const [checked, setChecked] = useState(true);
    const words = contextData.mnemonics.split(' ');

    const btnClick = () => {
        updateContextData({
            tabType: TabType.STEP3
        });
    };

    return (
        <Column gap="xl">
            <Text text="Verify Recovery Phrase" preset="title-bold" textCenter />
            <Text
                text="Click on the words to put them in the correct order to verify if the recovery phrase you backed up is correct"
                color="warning"
                textCenter
            />
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
            <FooterButtonContainer>
                <Button disabled={!checked} text="Continue" preset="primary" onClick={btnClick} />
            </FooterButtonContainer>
        </Column>
    );
}
