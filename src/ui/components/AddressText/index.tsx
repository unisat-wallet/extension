import { useState } from 'react';

import { shortAddress } from '@/ui/utils';

import { AddressDetailPopover } from '../AddressDetailPopover';

export const AddressText = ({ address, domain }: { address: string; domain?: string }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  return (
    <div>
      <div
        className={'cursor-pointer ' + (domain ? ' text-sm' : ' text-lg text-white')}
        onClick={() => {
          setPopoverVisible(true);
        }}>
        {domain && <div className="text-white text-lg">{domain}</div>}
        <span>{shortAddress(address)}</span>
      </div>
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
