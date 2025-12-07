import { Button, Card, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useExportPrivateKeyScreenLogic } from '@unisat/wallet-state';

export default function ExportPrivateKeyScreen() {
  const { t, setPassword, disabled, btnClick, handleOnKeyUp, privateKey, error, copy, onClickBack } =
    useExportPrivateKeyScreenLogic();

  return (
    <Layout>
      <Header onBack={onClickBack} title={t('export_private_key')} />
      <Content>
        {privateKey.wif == '' ? (
          <Column gap="lg">
            <Card>
              <Column gap="lg">
                <Text text={t('if_you_lose_your_private_key_your_assets_will_be_g')} preset="title-bold" color="red" />

                <Text text={t('if_you_share_the_private_key_to_others_your_assets')} preset="title-bold" color="red" />

                <Text text={t('private_key_is_only_stored_in_your_browser_it_is_y')} preset="title-bold" color="red" />
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
              onKeyUp={(e) => handleOnKeyUp(e as any)}
              autoFocus={true}
            />
            {error && <Text text={error} preset="regular" color="error" />}

            <Button text={t('show_private_key')} preset="primary" disabled={disabled} onClick={btnClick} />
          </Column>
        ) : (
          <Column>
            <Text text={t('if_you_ever_change_browsers_or_move_computers_you_')} preset="sub" size="sm" textCenter />

            <Text text={t('wif_private_key')} preset="sub" size="sm" textCenter mt="lg" />

            <Card
              onClick={(e) => {
                copy(privateKey.wif);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={privateKey.wif}
                  color="textDim"
                  style={{
                    overflowWrap: 'anywhere'
                  }}
                />
              </Row>
            </Card>

            <Text text={t('hex_private_key')} preset="sub" size="sm" textCenter mt="lg" />

            <Card
              onClick={(e) => {
                copy(privateKey.hex);
              }}>
              <Row>
                <Icon icon="copy" color="textDim" />
                <Text
                  text={privateKey.hex}
                  color="textDim"
                  style={{
                    overflowWrap: 'anywhere'
                  }}
                />
              </Row>
            </Card>
          </Column>
        )}
      </Content>
    </Layout>
  );
}
