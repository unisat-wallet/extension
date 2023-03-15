import { message } from 'antd';

import { useBlockstreamUrl } from '@/ui/state/settings/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';

import { Popover } from '../Popover';

export const AddressDetailPopover = ({ address, onClose }: { address: string; onClose: () => void }) => {
  const blockstreamUrl = useBlockstreamUrl();
  return (
    <Popover onClose={onClose}>
      <div className="flex flex-col items-center justify-center ">
        <span className="text-lg text-white">{shortAddress(address)}</span>
        <div
          className="flex rounded bg-primary-active p-1 px-3 mt-5 cursor-pointer items-center"
          onClick={(e) => {
            copyToClipboard(address).then(() => {
              message.success('Copied');
            });
          }}>
          <span className=" text-sm break-words max-w-sm">{address}</span>
          <img src="./images/copy-solid.svg" alt="" className="h-4_5 hover:opacity-100 ml-1" />
        </div>

        <div className="flex items-center text-lg text-white duration-80 opacity-60 hover:opacity-100 mt-5">
          <img src="./images/eye.svg" alt="" />
          <a
            className="text-white cursor-pointer hover:text-white "
            href={`${blockstreamUrl}/address/${address}`}
            target="_blank"
            rel="noreferrer">
            &nbsp;{'View on Block Explorer'}
          </a>
        </div>
      </div>
    </Popover>
  );
};
