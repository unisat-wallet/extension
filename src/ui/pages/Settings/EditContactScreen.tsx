import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import { Button, Column, Content, Footer, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { CHAINS_MAP } from '@unisat/wallet-shared';
import { useEditContactScreenLogic } from '@unisat/wallet-state';

const inputStyle = {
  backgroundColor: colors.black_muted,
  height: 48,
  padding: '12px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0
};

function EditContactScreen() {
  const {
    name,
    contactAddress,
    chainType,
    error,
    loading,
    handleNameChange,
    handleAddressChange,
    handleSubmit,
    handleDelete,
    onClickBack,
    address,
    t
  } = useEditContactScreenLogic();
  return (
    <Layout>
      <Header onBack={onClickBack} title={address ? t('edit_address') : t('add_address')} />
      <Content>
        <Column gap="xl" style={{ padding: `${spacing.large}px ${spacing.small}px` }}>
          <Column>
            <Text text={t('name_label')} preset="regular" />
            <Input
              preset="text"
              value={name}
              onChange={handleNameChange}
              placeholder={t('please_enter_name')}
              containerStyle={inputStyle}
              style={{ color: 'white' }}
            />
          </Column>

          <Column>
            <Text text={t('address_label')} preset="regular" />
            <Input
              preset="text"
              value={contactAddress}
              onChange={handleAddressChange}
              placeholder={t('please_enter_address')}
              containerStyle={inputStyle}
              style={{ color: 'white' }}
            />
          </Column>

          <Column>
            <Text text={t('network')} preset="regular" />
            <Row
              style={{
                ...inputStyle,
                height: 48,
                display: 'flex',
                alignItems: 'center'
              }}
              itemsCenter>
              <Row itemsCenter>
                <Image src={IMAGE_SOURCE_MAP[CHAINS_MAP[chainType].icon]} size={30} style={{ marginRight: 8 }} />
                <Text text={CHAINS_MAP[chainType].label} color="text" />
              </Row>
            </Row>
          </Column>

          {error && (
            <Row
              style={{
                padding: spacing.small,
                backgroundColor: 'rgba(245, 84, 84, 0.1)',
                borderRadius: 8
              }}>
              <Text text={error} preset="regular" color="error" />
            </Row>
          )}
        </Column>
      </Content>
      <Footer style={{ padding: '16px 16px 32px 16px' }}>
        <Column full gap="lg" style={{ marginBottom: 0 }}>
          <Button
            text={loading ? t('saving') : t('save')}
            onClick={handleSubmit}
            disabled={loading}
            preset="primary"
            style={{
              minHeight: 48
            }}
            full
          />
          {address && (
            <Button
              text={t('delete')}
              preset="delete"
              onClick={handleDelete}
              disabled={loading}
              style={{
                minHeight: 48
              }}
              full
            />
          )}
        </Column>
      </Footer>
    </Layout>
  );
}

export default EditContactScreen;
