import { Button, Column, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { CloseOutlined } from '@ant-design/icons';

const disclaimStr =
  'You have the option to sign all transactions at once, but please note that UniSat Wallet will not verify each transaction individually. We strongly recommend using it only on trusted and familiar websites to minimize the risk of potential losses.';
export default function MultiSignDisclaimerModal({
  txCount,
  onClose,
  onContinue
}: {
  txCount: number;
  onClose: any;
  onContinue: any;
}) {
  const { t } = useI18n();
  return (
    <BottomModal onClose={onClose}>
      <Column>
        <Row justifyBetween itemsCenter style={{ height: 20 }}>
          <Row />
          <Text text={t('multisign_disclaimer')} textCenter size="md" />
          <Row
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        </Row>

        <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <Column justifyCenter rounded mb="lg" style={{ maxHeight: '50vh', overflow: 'auto' }}>
          <Text style={{ fontSize: fontSizes.sm, lineHeight: 2 }} text={disclaimStr} />

          <Text
            mt="lg"
            style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
            text={t('by_proceeding_you_confirm_that_youve_read_and_accepted_this_disclaimer')}></Text>
        </Column>

        <Button
          text={`${t('sign_all')} ${txCount} ${t('transactions_at_once')}`}
          preset="primaryV2"
          onClick={() => {
            onContinue();
          }}
        />
      </Column>
    </BottomModal>
  );
}
