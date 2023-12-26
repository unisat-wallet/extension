import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';
import { Checkbox } from 'antd';
import { useState } from 'react';

export const NoticePopover = ({ onClose }: { onClose: () => void }) => {

  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);
  const [checked4, setChecked4] = useState(false);

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Text text="Compatibility Tips" preset="title-bold" />

        <Column style={{ marginTop: 20 }} gap="zero">
          <Text text="Ordinals Assets" preset="regular-bold" mb="sm" />

          <Checkbox
            checked={checked1}
            onChange={(e) => {
              setChecked1(e.target.checked);
            }}
          >
            <div style={{ fontSize: fontSizes.sm }}>
              <span style={{ color: 'gold' }}>Inscriptions</span> and <span style={{ color: 'gold' }}>BRC20</span> are
              supported.{' '}
            </div>
          </Checkbox>
          <div>
            <Checkbox
              checked={checked2}
              onChange={(e) => {
                setChecked2(e.target.checked);
              }}
            >
              <div style={{ fontSize: fontSizes.sm }}>
                <span style={{ color: 'red' }}>Cursed inscriptions</span> and{' '}
                <span style={{ color: 'red' }}>Rare sats </span>are not recognized. Please refrain from using these two
                types of assets.{' '}
              </div>
            </Checkbox>
          </div>
          <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

          <Text text="Atomicals Assets" preset="regular-bold" mb="sm" />
          <Checkbox checked={checked3} onChange={e=>setChecked3(e.target.checked)}>
            <div style={{ fontSize: fontSizes.sm }}>
              <span style={{ color: 'gold' }}>ARC20</span> are supported.{' '}
            </div>
          </Checkbox>
          <div>
            <Checkbox checked={checked4} onChange={e=>setChecked4(e.target.checked)}>
              <div style={{ fontSize: fontSizes.sm }}>
                <span style={{ color: 'red' }}>Non-ARC20 Atomicals assets</span> are not recognized. Please refrain from
                using
                this type of assets.{' '}
              </div>
            </Checkbox>
          </div>
          <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
        </Column>

        <Row full>
          <Button
            text="Got it"
            preset="primary"
            disabled={!checked1 || !checked2 || !checked3 || !checked4}
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
