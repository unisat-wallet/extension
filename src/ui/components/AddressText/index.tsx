import { useState } from 'react';

import { shortAddress } from '@/ui/utils';

import { AddressDetailPopover } from '../AddressDetailPopover';
import { Column } from '../Column';
import { Text } from '../Text';

export const AddressText = ({ address, domain }: { address: string; domain?: string }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  return (
    <Column>
      <Column
        onClick={() => {
          setPopoverVisible(true);
        }}>
        {domain && <Text text={domain} />}
        <Text text={shortAddress(address)} />
      </Column>
      {popoverVisible && (
        <AddressDetailPopover
          address={address}
          onClose={() => {
            setPopoverVisible(false);
          }}
        />
      )}
    </Column>
  );
};
