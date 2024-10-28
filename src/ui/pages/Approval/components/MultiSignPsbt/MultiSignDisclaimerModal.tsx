import { Button, Column, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { CloseOutlined } from '@ant-design/icons';

const disclaimStr = `You have the option to sign all transactions at once, but please note that UniSat Wallet will not verify each transaction individually. We strongly recommend using it only on trusted and familiar websites to minimize the risk of potential losses.`;
export default function MultiSignDisclaimerModal({
  txCount,
  onClose,
  onContinue
}: {
  txCount: number;
  onClose: any;
  onContinue: any;
}) {
  return (
    <BottomModal onClose={onClose}>
      <Column>
        <Row justifyBetween itemsCenter style={{ height: 20 }}>
          <Row />
          <Text text="MultiSign Disclaimer" textCenter size="md" />
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
            text={`By proceeding, you confirm that you’ve read and accepted this disclaimer.`}></Text>
        </Column>

        <Button
          text={`Sign all ${txCount} transactions at once`}
          preset="primaryV2"
          onClick={() => {
            onContinue();
          }}
        />
      </Column>
    </BottomModal>
  );
}
