import React from 'react';

export interface SpinProps {
  size?: 'small' | 'default' | 'large';
  spinning?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Spin({
  size = 'default',
  spinning = true,
  children,
  style,
  className
}: SpinProps) {
  // Size configurations
  const sizeConfig = {
    small: { size: 16, strokeWidth: 2 },
    default: { size: 20, strokeWidth: 2 },
    large: { size: 32, strokeWidth: 3 }
  };
  
  const config = sizeConfig[size];
  
  if (!spinning && children) {
    return <>{children}</>;
  }
  
  const spinnerElement = (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: `${config.size}px`,
          height: `${config.size}px`,
          border: `${config.strokeWidth}px solid rgba(255, 255, 255, 0.3)`,
          borderTopColor: '#ffde04',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
  
  if (children) {
    return (
      <div style={{ position: 'relative', ...style }}>
        <div style={{ opacity: spinning ? 0.5 : 1 }}>
          {children}
        </div>
        {spinning && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <div
              style={{
                width: `${config.size}px`,
                height: `${config.size}px`,
                border: `${config.strokeWidth}px solid rgba(255, 255, 255, 0.3)`,
                borderTopColor: '#ffde04',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
        )}
      </div>
    );
  }
  
  return spinnerElement;
}
