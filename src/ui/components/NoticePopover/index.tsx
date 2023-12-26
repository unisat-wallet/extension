import { useNavigate } from '@/ui/pages/MainRoute';
import { useAppDispatch } from '@/ui/state/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const NoticePopover = ({ onClose }: { onClose: () => void }) => {

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text="Assets Advisory" preset="title-bold" />

        <Column style={{ marginTop: 20 }} gap="zero">
          <Text text="Ordinals Assets" preset="regular-bold" mb="sm" />
          <div style={{ fontSize: fontSizes.sm }}>
            <span>- </span>
            <span style={{ color: 'gold' }}>Inscriptions</span> and <span style={{ color: 'gold' }}>BRC20</span> are
            supported.{' '}
          </div>
          <div style={{ fontSize: fontSizes.sm }}>
            <span>- </span>
            <span style={{ color: 'red' }}>Cursed inscriptions</span> and{' '}
            <span style={{ color: 'red' }}>Rare sats </span>are not recognized. Please refrain from using these two
            types of assets.{' '}
          </div>
          <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
          <Text text="Atomicals Assets" preset="regular-bold" mb="sm" />
          <div style={{ fontSize: fontSizes.sm }}>
            <span>- </span>
            <span style={{ color: 'gold' }}>ARC20</span> are supported.{' '}
          </div>
          <div style={{ fontSize: fontSizes.sm }}>
            <span>- </span>
            <span style={{ color: 'red' }}>NFT (Realm and so on )</span>are not recognized. Please refrain from using
            this type of assets.{' '}
          </div>
          <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
        </Column>

        <Row full>
          <Button
            text="Got it"
            preset="primary"
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
