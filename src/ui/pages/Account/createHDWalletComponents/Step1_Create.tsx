import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useEffect, useState } from 'react';

import { Button, Card, Column, Grid, Icon, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { useI18n } from '@/ui/hooks/useI18n';
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
  const { t } = useI18n();
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
      tools.toastSuccess(t('copied'));
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
      <Text text={t('secret_recovery_phrase')} preset="title-bold" textCenter />
      <Text text={t('this_phrase_is_the_only_way_to_recover_your_wallet')} color="warning" textCenter />

      <Row
        justifyCenter
        itemsCenter
        onClick={(e) => {
          copy(contextData.mnemonics);
        }}>
        <Icon icon="copy" color="textDim" />
        <Text text={t('copy_to_clipboard')} color="textDim" />
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
          <Text text={t('i_saved_my_secret_recovery_phrase')} />
        </Checkbox>
      </Row>

      <FooterButtonContainer>
        <Button disabled={!checked} text={t('continue')} preset="primary" onClick={btnClick} />
      </FooterButtonContainer>
    </Column>
  );
}
