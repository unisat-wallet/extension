import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';

import { useTools } from '../ActionComponent';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { CopyOutlined } from '@ant-design/icons';

export function AddressBar() {
  const tools = useTools();
  const address = useAccountAddress();
  return (
    <Row
      selfItemsCenter
      itemsCenter
      onClick={(e) => {
        copyToClipboard(address).then(() => {
          tools.toastSuccess('Copied');
        });
      }}>
      <Text text={shortAddress(address)} color="textDim" />
      {/*<Icon icon="copy" color="textDim" />*/}
      <CopyOutlined style={{color:'#888',fontSize:14}}/>
    </Row>
  );
}
