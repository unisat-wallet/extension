import { Checkbox } from 'antd';
import { useState } from 'react';

import { Button, Column, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { CloseOutlined } from '@ant-design/icons';

const disclaimStr = `You can sign all transactions at once, but please be aware that UniSat Wallet will skip checking these transactions during when signing at once. Please only use this feature on familiar and trusted websites.`;
export default function MultiSignDisclaimerModal({ onClose, onContinue }: { onClose: any; onContinue: any }) {
  const [understand, setUnderstand] = useState(false);

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
            text={'Before proceeding, please carefully read and accept the disclaimer.'}></Text>
        </Column>

        <Row justifyCenter>
          <Checkbox
            onChange={() => {
              setUnderstand(!understand);
            }}
            checked={understand}
            style={{ fontSize: fontSizes.sm }}>
            <Text text="" />
          </Checkbox>
        </Row>

        <Button
          text={`Continue to sign all at once`}
          preset="primaryV2"
          disabled={!understand}
          onClick={() => {
            onContinue();
          }}
        />
      </Column>
    </BottomModal>
  );
}
