import { shortAddress } from '@/ui/utils';
import { useAddressExplorerUrl, useI18n, useTools } from '@unisat/wallet-state';

import { Card } from '../Card';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const AddressDetailPopover = ({ address, onClose }: { address: string; onClose: () => void }) => {
  const tools = useTools();
  const addressExplorerUrl = useAddressExplorerUrl(address);
  const { t } = useI18n();
  return (
    <Popover onClose={onClose}>
      <Column>
        <Text text={shortAddress(address)} textCenter />
        <Card preset="style2" onClick={(e) => tools.copyToClipboard(address)}>
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

        <Row justifyCenter onClick={() => tools.openUrl(addressExplorerUrl)}>
          <Icon icon="eye" color="textDim" />
          <Text preset="regular-bold" text={t('view_on_block_explorer')} color="textDim" />
        </Row>
      </Column>
    </Popover>
  );
};
