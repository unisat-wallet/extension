import { message } from 'antd';
import { MouseEventHandler } from 'react';

import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';

// import './index.less';
export const AddressBar: React.FC<{ onClick?: MouseEventHandler<HTMLElement> }> = ({ onClick }) => {
  const address = useAccountAddress();
  return (
    <>
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
        onClick={(e) => {
          copyToClipboard(address).then(() => {
            message.success('Copied');
          });
        }}>
        <img src="./images/copy-solid.svg" alt="" className="h-4_5 hover:opacity-100" />
        <span className="text-lg text-white">{shortAddress(address)}</span>
      </div>
    </>
  );
};
