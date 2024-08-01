import React from 'react';

export const BottomModal = ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => {
    return (
        <div
            className="popover-container"
            style={{
                backgroundColor: 'rgba(255,255,255,0.1)'
            }}>
            <div
                style={{
                    backgroundColor: '#181A1F',
                    width: '100%',
                    padding: 20,
                    borderRadius: 15,
                    position: 'fixed',
                    bottom: 0
                }}>
                {children}
            </div>
        </div>
    );
};
