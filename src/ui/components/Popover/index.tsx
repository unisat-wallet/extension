import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

import { Row } from '../Row';

export const Popover = ({
  children,
  onClose,
  contentStyle = {}
}: {
  children: React.ReactNode;
  onClose?: () => void;
  contentStyle?: React.CSSProperties;
}) => {
  return (
    <div
      className="popover-container"
      style={{
        backgroundColor: 'rgba(0,0,0,0.8)'
      }}>
      <div
        style={{
          backgroundColor: 'rgba(36, 40, 47, 1)',
          width: 340,
          padding: 20,
          borderRadius: 15,
          position: 'relative',
          ...contentStyle
        }}>
        {onClose && (
          <Row
            style={{ position: 'absolute', top: 20, right: 20 }}
            justifyEnd
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        )}

        {children}
      </div>
    </div>
  );
};
