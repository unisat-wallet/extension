import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'default';
  style?: React.CSSProperties;
  className?: string;
}

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'default',
  style,
  className
}: SwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  // Size configurations
  const sizeConfig = {
    small: { width: 28, height: 16, dotSize: 12 },
    default: { width: 44, height: 22, dotSize: 18 }
  };
  
  const config = sizeConfig[size];
  
  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        backgroundColor: checked ? '#ffde04' : '#6a6868',
        borderRadius: `${config.height / 2}px`,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 0.3s ease',
        ...style
      }}
    >
      <div
        style={{
          width: `${config.dotSize}px`,
          height: `${config.dotSize}px`,
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          position: 'absolute',
          top: '50%',
          left: checked 
            ? `${config.width - config.dotSize - 2}px` 
            : '2px',
          transform: 'translateY(-50%)',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      />
    </div>
  );
}

export function Skeleton(props: any) {
  return <div />;
}
