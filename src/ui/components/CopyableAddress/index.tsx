import { copyToClipboard, shortAddress } from '@/ui/utils';
import { useI18n, useTools } from '@unisat/wallet-state';

import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export function CopyableAddress({ address }: { address: string }) {
  const tools = useTools();
  const { t } = useI18n();
  return (
    <Row
      itemsCenter
      gap="sm"
      onClick={(e) => {
        copyToClipboard(address).then(() => {
          tools.toastSuccess(t('copied'));
        });
      }}>
      <Icon icon="copy" color="textDim" />
      <Text text={shortAddress(address)} color="textDim" />
    </Row>
  );
}
