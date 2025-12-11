import { Button, Column, Content, Input, Layout, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { useCreatePasswordScreenLogic, useI18n } from '@unisat/wallet-state';

type Status = '' | 'error' | 'warning' | undefined;

export default function CreatePasswordScreen() {
  const {
    strongTextRenderData,
    matchTextRenderData,
    onClickConfirm,
    disabled,
    onConfirmPasswordChange,
    onPasswordChange
  } = useCreatePasswordScreenLogic();
  const { t } = useI18n();

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!disabled && 'Enter' == e.key) {
      onClickConfirm();
    }
  };

  return (
    <Layout>
      <Content preset="middle">
        <Column fullX fullY>
          <Column gap="xl" style={{ marginTop: 200 }}>
            <Text text={t('create_a_password')} preset="title-bold" textCenter />
            <Text text={t('you_will_use_this_to_unlock_your_wallet')} preset="sub" textCenter />
            <Column>
              <Input preset="password" onChange={onPasswordChange} autoFocus={true} />
              {strongTextRenderData && (
                <Column>
                  <Row>
                    <Text size="xs" text={t('password_strength')} />
                    <Text size="xs" text={strongTextRenderData.text} style={{ color: strongTextRenderData.color }} />
                  </Row>
                  {strongTextRenderData.tip ? <Text size="xs" preset="sub" text={strongTextRenderData.tip} /> : null}
                </Column>
              )}
            </Column>

            <Column>
              <Input
                preset="password"
                placeholder={t('confirm_password')}
                onChange={onConfirmPasswordChange}
                onKeyUp={(e) => handleOnKeyUp(e as any)}
              />
              {matchTextRenderData && (
                <Row>
                  <Text size="xs" text={matchTextRenderData.text} style={{ color: colors.red }} />
                </Row>
              )}
            </Column>

            <Button disabled={disabled} text={t('continue')} preset="primary" onClick={onClickConfirm} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
