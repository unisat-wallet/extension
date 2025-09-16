import React from 'react';

export interface CheckboxChangeEvent {
  target: {
    checked: boolean;
  };
}

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (e: CheckboxChangeEvent) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Checkbox(props: CheckboxProps) {
  const { checked = false, onChange, style, disabled = false, children, className } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    onChange?.({
      target: {
        checked: e.target.checked
      }
    });
  };

  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}>
      <div
        style={{
          position: 'relative',
          width: '15px',
          height: '15px',
          marginRight: '8px'
        }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          style={{
            appearance: 'none',
            width: '15px',
            height: '15px',
            backgroundColor: checked ? '#ffde04' : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '2px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        {checked && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '9px',
              height: '5px',
              border: '2px solid #141414ff',
              borderTop: 'none',
              borderRight: 'none',
              transform: 'translate(-50%, -75%) rotate(-45deg)',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      {children}
    </label>
  );
}
