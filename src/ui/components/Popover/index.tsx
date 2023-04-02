import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

import { Row } from '../Row';

export const Popover = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <div
      className="popover-container"
      style={{
        backgroundColor: 'rgba(255,255,255,0.1)'
      }}>
      <div style={{ backgroundColor: '#1C1919', width: 340, padding: 20, borderRadius: 5 }}>
        <Row
          justifyEnd
          onClick={() => {
            onClose();
          }}>
          <CloseOutlined />
        </Row>
        {children}
      </div>
    </div>
  );
};
