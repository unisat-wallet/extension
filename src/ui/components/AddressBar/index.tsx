import { shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';
import { useAccountAddress, useTools } from '@unisat/wallet-state';

import { Row } from '../Row';
import { Text } from '../Text';

export function AddressBar() {
  const tools = useTools();
  const address = useAccountAddress();
  return (
    <Row selfItemsCenter itemsCenter onClick={(e) => tools.copyToClipboard(address)}>
      <Text text={shortAddress(address)} color="textDim" />
      <CopyOutlined style={{ color: '#888', fontSize: 14 }} />
    </Row>
  );
}
