import { useState } from 'react';

import { shortAddress } from '@/ui/utils';

import { AddressDetailPopover } from '../AddressDetailPopover';

export const AddressText = ({ address }: { address: string }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  return (
    <div>
      <span
        className="text-lg  cursor-pointer text-white"
        onClick={() => {
          setPopoverVisible(true);
        }}>
        {shortAddress(address)}
      </span>
      {popoverVisible && (
        <AddressDetailPopover
          address={address}
          onClose={() => {
            setPopoverVisible(false);
          }}
        />
      )}
    </div>
  );
};
