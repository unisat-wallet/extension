import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { CloseCircleFilled } from '@ant-design/icons';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export default function KeystonePopover({
  onClose,
  onConfirm,
  msg
}: {
  onClose: () => void;
  onConfirm: () => void;
  msg: string;
}) {
  const { t } = useI18n();
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter gap="lg">
        <CloseCircleFilled
          style={{
            color: colors.red,
            fontSize: 40
          }}
        />

        <Text textCenter text={msg} />

        <a href="https://keyst.one/" target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
          {t('tutorial')}
        </a>

        <Row full mt="lg">
          <Button
            text={t('cancel')}
            full
            preset="default"
            onClick={() => {
              onClose();
            }}
          />
          <Button
            text={t('try_again')}
            full
            preset="primary"
            onClick={() => {
              onConfirm();
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
}
