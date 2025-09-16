import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '@/ui/theme/colors';

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  style?: CSSProperties;
  marks?: { [key: number]: string | React.ReactNode };
  tooltipVisible?: boolean;
  tooltipFormatter?: (value: number) => string;
}

const $sliderContainer: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 32,
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  userSelect: 'none'
};

const $sliderTrack: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 4,
  backgroundColor: colors.white_muted,
  borderRadius: 2,
  cursor: 'pointer'
};

const $sliderFilled: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: colors.yellow,
  borderRadius: 2,
  transition: 'width 0.1s ease'
};

const $sliderThumb: CSSProperties = {
  position: 'absolute',
  top: '50%',
  width: 16,
  height: 16,
  backgroundColor: colors.yellow,
  borderRadius: '50%',
  border: `2px solid ${colors.white}`,
  cursor: 'grab',
  transform: 'translate(-50%, -50%)',
  transition: 'all 0.1s ease',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
};

const $sliderThumbActive: CSSProperties = {
  ...$sliderThumb,
  cursor: 'grabbing',
  transform: 'translate(-50%, -50%) scale(1.2)'
};

const $sliderTooltip: CSSProperties = {
  position: 'absolute',
  bottom: '120%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: colors.black,
  color: colors.white,
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  whiteSpace: 'nowrap',
  border: `1px solid ${colors.yellow}`,
  zIndex: 10
};

const $sliderMark: CSSProperties = {
  position: 'absolute',
  top: '100%',
  transform: 'translateX(-50%)',
  fontSize: 12,
  color: colors.textDim,
  marginTop: 8
};

export function Slider({
  min = 0,
  max = 100,
  value,
  defaultValue = 0,
  step = 1,
  disabled = false,
  onChange,
  onAfterChange,
  style = {},
  marks,
  tooltipVisible = false,
  tooltipFormatter = (val) => val.toString()
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Normalize value to percentage (0-1)
  const normalizeValue = useCallback((val: number) => {
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  }, [min, max]);

  // Denormalize percentage to actual value
  const denormalizeValue = useCallback((percentage: number) => {
    const val = min + percentage * (max - min);
    return Math.round(val / step) * step;
  }, [min, max, step]);

  // Get value from mouse position
  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return internalValue;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return denormalizeValue(percentage);
  }, [denormalizeValue, internalValue]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    setShowTooltip(true);
    
    const newValue = getValueFromPosition(e.clientX);
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [disabled, getValueFromPosition, onChange]);

  // Global mouse move and up handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowTooltip(false);
      onAfterChange?.(internalValue);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getValueFromPosition, onChange, onAfterChange, internalValue]);

  // Handle track click
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isDragging) return;
    
    const newValue = getValueFromPosition(e.clientX);
    setInternalValue(newValue);
    onChange?.(newValue);
    onAfterChange?.(newValue);
  }, [disabled, isDragging, getValueFromPosition, onChange, onAfterChange]);

  const percentage = normalizeValue(internalValue);
  const thumbPosition = `${percentage * 100}%`;

  return (
    <div 
      ref={containerRef}
      style={{
        ...$sliderContainer,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      <div 
        ref={trackRef}
        style={$sliderTrack}
        onClick={handleTrackClick}
      >
        <div 
          style={{
            ...$sliderFilled,
            width: `${percentage * 100}%`
          }}
        />
        
        <div
          style={{
            ...(isDragging ? $sliderThumbActive : $sliderThumb),
            left: thumbPosition
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setShowTooltip(tooltipVisible)}
          onMouseLeave={() => !isDragging && setShowTooltip(false)}
        >
          {(showTooltip || tooltipVisible) && (
            <div style={$sliderTooltip}>
              {tooltipFormatter(internalValue)}
            </div>
          )}
        </div>
      </div>

      {marks && Object.entries(marks).map(([markValue, label]) => {
        const markPercentage = normalizeValue(Number(markValue));
        return (
          <div
            key={markValue}
            style={{
              ...$sliderMark,
              left: `${markPercentage * 100}%`
            }}
          >
            {typeof label === 'string' ? label : label}
          </div>
        );
      })}
    </div>
  );
}