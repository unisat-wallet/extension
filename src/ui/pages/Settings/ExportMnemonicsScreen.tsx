import { Button, Card, Column, Content, Grid, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useExportMnemonicsScreenLogic } from '@unisat/wallet-state';

export default function ExportMnemonicsScreen() {
  const {
    words,
    pathName,
    t,
    setPassword,
    disabled,
    btnClick,
    handleOnKeyUp,
    mnemonic,
    passphrase,
    error,
    copy,
    keyring,
    onClickBack
  } = useExportMnemonicsScreenLogic();
  return (
    <Layout>
      <Header onBack={onClickBack} title={t('secret_recovery_phrase')} />

      <Content>
        {mnemonic == '' ? (
          <Column>
            <Card>
              <Column gap="lg">
                <Text text={t('if_you_lose_your_secret_recovery_phrase_your_asset')} preset="title-bold" color="red" />

                <Text text={t('if_you_share_the_secret_recovery_phrase_to_others_')} preset="title-bold" color="red" />

                <Text text={t('secret_recovery_phrase_is_only_stored_in_your_brow')} preset="title-bold" color="red" />
              </Column>
            </Card>

            <Text
              text={t('please_make_sure_you_have_read_the_security_tips_a')}
              preset="title"
              color="warning"
              textCenter
              my="xl"
            />
            <Input
              preset="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => handleOnKeyUp(e)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button disabled={disabled} text={t('show_secret_recovery_phrase')} preset="primary" onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text
              text={t('this_phrase_is_the_only_way_to_recover_your_wallet')}
              color="warning"
              textCenter
              mt="xl"
              mb="xl"
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
            <Card>
              <Column>
                <Text text={t('advance_options')} />
                <Text
                  text={`${t('derivation_path')}: ${keyring.hdPath}/0 (${pathName})`}
                  preset="sub"
                  onClick={() => {
                    copy(keyring.hdPath);
                  }}
                  disableTranslate
                />
                {passphrase && <Text text={`${t('passphrase')}: ${passphrase}`} preset="sub" disableTranslate />}
              </Column>
            </Card>
          </Column>
        )}
      </Content>
    </Layout>
  );
}
