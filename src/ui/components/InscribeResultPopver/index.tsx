import { Inscription } from '@/shared/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAppDispatch, useI18n, useWallet } from '@unisat/wallet-state';

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
  const { t } = useI18n();

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <InscriptionPreview data={inscription} preset="medium" style={{ maxWidth: '200px' }} />
        <Column mt="lg">
          <Text text={t('you_have_inscribed_a_transfer')} textCenter />
          <Text text={t('please_wait_for_the_update_of_brc20')} textCenter />
          <Text text={t('about_3_minutes')} textCenter />
        </Column>

        <Row full mt="lg">
          <Button
            text={t('ok')}
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
