import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';

import { useTools } from '../ActionComponent';
import { Card } from '../Card';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const AddressDetailPopover = ({ address, onClose }: { address: string; onClose: () => void }) => {
  const tools = useTools();
  const blockstreamUrl = useBlockstreamUrl();
  return (
    <Popover onClose={onClose}>
      <Column>
        <Text text={shortAddress(address)} textCenter />
        <Card
          preset="style2"
          onClick={(e) => {
            copyToClipboard(address).then(() => {
              tools.toastSuccess('Copied');
            });
          }}>
          <Row itemsCenter>
            <Text
              text={address}
              style={{
                overflowWrap: 'anywhere'
              }}
            />
            <Icon icon="copy" />
          </Row>
        </Card>

        <Row
          justifyCenter
          onClick={() => {
            window.open(`${blockstreamUrl}/address/${address}`);
          }}>
          <Icon icon="eye" color="textDim" />
          <Text preset="regular-bold" text="View on Block Explorer" color="textDim" />
        </Row>
      </Column>
    </Popover>
  );
};
