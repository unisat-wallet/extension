import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

import { Row } from '../Row';

export const Popover = ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => {
    return (
        <div
            className="popover-container"
            style={{
                backgroundColor: 'rgba(255,255,255,0.1)'
            }}>
            <div
                style={{ backgroundColor: '#181A1F', width: 340, padding: 20, borderRadius: 15, position: 'relative' }}>
                {onClose && (
                    <Row
                        style={{ position: 'absolute', top: 10, right: 10 }}
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
