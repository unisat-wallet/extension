import { useState } from 'react';

import { Button, Card, Column, Grid, Row, Text } from '@/ui/components';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { useI18n } from '@/ui/hooks/useI18n';
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
  const { t } = useI18n();

  const btnClick = () => {
    updateContextData({
      tabType: TabType.STEP3
    });
  };

  return (
    <Column gap="xl">
      <Text text={t('verify_recovery_phrase')} preset="title-bold" textCenter />
      <Text text={t('click_on_the_words_to_put_them_in_the_correct_orde')} color="warning" textCenter />
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
        <Button disabled={!checked} text={t('continue')} preset="primary" onClick={btnClick} />
      </FooterButtonContainer>
    </Column>
  );
}
