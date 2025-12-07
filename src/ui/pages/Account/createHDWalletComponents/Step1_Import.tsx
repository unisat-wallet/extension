import { useState } from 'react';

import { Button, Card, Column, Grid, Input, Radio, RadioGroup, Row, Text } from '@/ui/components';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { ContextData, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { useCreateWalletLogicImportWordsStep } from '@unisat/wallet-state';

export function Step1_Import(params: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const { contextData } = params;

  const [curInputIndex, setCurInputIndex] = useState(0);

  const { wordsItems, t, onHandleEventPaste, inputWords, onClickNext, onClickWordsItem, onInputWordsChange, disabled } =
    useCreateWalletLogicImportWordsStep(params as any);

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      onClickNext();
    }
  };

  return (
    <Column gap="lg">
      <Text text={t('secret_recovery_phrase')} preset="title-bold" textCenter />
      <Text text={t('import_an_existing_wallet_with_your_secret_recover')} preset="sub" textCenter />

      {wordsItems.length > 1 ? (
        <Row justifyCenter>
          <RadioGroup
            onChange={(value) => {
              onClickWordsItem(wordsItems[value]);
            }}
            value={contextData.wordsType}>
            {wordsItems.map((v) => (
              <Radio key={v.key} value={v.key}>
                {v.label}
              </Radio>
            ))}
          </RadioGroup>
        </Row>
      ) : null}

      <Row justifyCenter>
        <Grid columns={2}>
          {inputWords.map((_, index) => {
            return (
              <Row key={index}>
                <Card gap="zero">
                  <Text text={`${index + 1}. `} style={{ width: 25 }} textEnd color="textDim" />
                  <Input
                    containerStyle={{ width: 80, minHeight: 25, height: 25, padding: 0 }}
                    style={{ width: 60 }}
                    value={_}
                    onPaste={(e) => {
                      onHandleEventPaste(e, index);
                    }}
                    onChange={(e) => {
                      onInputWordsChange(e, index);
                    }}
                    onFocus={(e) => {
                      setCurInputIndex(index);
                    }}
                    onBlur={(e) => {
                      setCurInputIndex(999);
                    }}
                    onKeyUp={(e) => handleOnKeyUp(e as React.KeyboardEvent<HTMLInputElement>)}
                    autoFocus={index == curInputIndex}
                    preset={'password'}
                    placeholder=""
                  />
                </Card>
              </Row>
            );
          })}
        </Grid>
      </Row>

      <FooterButtonContainer>
        <Button
          disabled={disabled}
          text={t('continue')}
          preset="primary"
          onClick={() => {
            onClickNext();
          }}
        />
      </FooterButtonContainer>
    </Column>
  );
}
