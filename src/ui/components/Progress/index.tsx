import React from 'react';

export interface ProgressProps {
  percent?: number;
  showInfo?: boolean;
  size?: 'small' | 'default' | 'large';
  strokeColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Progress({
  percent = 0,
  showInfo = true,
  size = 'default',
  strokeColor = '#1890ff',
  strokeWidth,
  style,
  className
}: ProgressProps) {
  // Size configurations
  const sizeConfig = {
    small: { height: 6, fontSize: 12 },
    default: { height: 8, fontSize: 14 },
    large: { height: 10, fontSize: 16 }
  };
  
  const config = sizeConfig[size];
  const height = strokeWidth || config.height;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  
  return (
    <div 
      className={className}
      style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        ...style 
      }}
    >
      <div
        style={{
          flex: 1,
          height: `${height}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedPercent}%`,
            backgroundColor: strokeColor,
            borderRadius: `${height / 2}px`,
            transition: 'width 0.3s ease',
            position: 'absolute',
            left: 0,
            top: 0
          }}
        />
      </div>
      {showInfo && (
        <span
          style={{
            fontSize: `${config.fontSize}px`,
            color: '#ffffff',
            minWidth: '36px',
            textAlign: 'right'
          }}
        >
          {Math.round(clampedPercent)}%
        </span>
      )}
    </div>
  );
}
