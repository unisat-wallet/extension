import { copyToClipboard, shortAddress } from '@/ui/utils';

import { useTools } from '../ActionComponent';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export function CopyableAddress({ address }: { address: string }) {
  const tools = useTools();
  return (
    <Row
      itemsCenter
      gap="sm"
      onClick={(e) => {
        copyToClipboard(address).then(() => {
          tools.toastSuccess('Copied');
        });
      }}>
      <Icon icon="copy" color="textDim" />
      <Text text={shortAddress(address)} color="textDim" />
    </Row>
  );
}
