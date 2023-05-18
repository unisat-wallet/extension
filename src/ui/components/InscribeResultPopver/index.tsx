import { Inscription } from '@/shared/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAppDispatch } from '@/ui/state/hooks';
import { useWallet } from '@/ui/utils';

import { Button } from '../Button';
import { Column } from '../Column';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const InscribeResultPopver = ({ inscription, onClose }: { inscription: Inscription; onClose: () => void }) => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <InscriptionPreview data={inscription} preset="medium" />
        <Column mt="lg">
          <Text text="You have inscribed a TRANSFER " textCenter />
          <Text text="Please wait for the update of BRC20" textCenter />
          <Text text=" (about 3 minutes)" textCenter />
        </Column>

        <Row full mt="lg">
          <Button
            text="OK"
            full
            preset="primary"
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
