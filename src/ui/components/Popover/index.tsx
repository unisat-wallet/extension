import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

export const Popover = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <div className="popover-container bg-white bg-opacity-50">
      <div style={{ backgroundColor: '#1C1919' }} className="rounded-md px-5 py-5 w-115">
        <div className="flex justify-end">
          <CloseOutlined
            className="cursor-pointer"
            onClick={() => {
              onClose();
            }}
          />
        </div>
        {children}
      </div>
    </div>
  );
};
