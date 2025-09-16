import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  overlayStyle?: React.CSSProperties;
  overlayInnerStyle?: React.CSSProperties;
  destroyTooltipOnHide?: boolean;
  autoAdjustOverflow?: boolean;
  arrowPointAtCenter?: boolean;
  align?: {
    points?: string[];
    offset?: number[];
    overflow?: {
      adjustX?: boolean;
      adjustY?: boolean;
    };
  };
}

export function Tooltip({
  title,
  children,
  placement = 'top',
  overlayStyle = {},
  overlayInnerStyle = {},
  destroyTooltipOnHide = false,
  autoAdjustOverflow = true,
  arrowPointAtCenter = false,
  align = {}
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;
    let actualPlacement = placement;

    // Calculate base position based on placement
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        // If tooltip would go above viewport, flip to bottom
        if (autoAdjustOverflow && top < 8) {
          top = triggerRect.bottom + 8;
          actualPlacement = 'bottom';
        }
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        // If tooltip would go below viewport, flip to top
        if (autoAdjustOverflow && top + tooltipRect.height > viewport.height - 8) {
          top = triggerRect.top - tooltipRect.height - 8;
          actualPlacement = 'top';
        }
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        // If tooltip would go left of viewport, flip to right
        if (autoAdjustOverflow && left < 8) {
          left = triggerRect.right + 8;
          actualPlacement = 'right';
        }
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        // If tooltip would go right of viewport, flip to left
        if (autoAdjustOverflow && left + tooltipRect.width > viewport.width - 8) {
          left = triggerRect.left - tooltipRect.width - 8;
          actualPlacement = 'left';
        }
        break;
    }

    // Apply custom align offset if provided
    if (align.offset) {
      left += align.offset[0] || 0;
      top += align.offset[1] || 0;
    }

    // Final boundary checks with auto adjustment
    const shouldAdjustX = autoAdjustOverflow && (align.overflow?.adjustX !== false);
    const shouldAdjustY = autoAdjustOverflow && (align.overflow?.adjustY !== false);
    
    if (shouldAdjustX) {
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewport.width - 8) {
        left = viewport.width - tooltipRect.width - 8;
      }
    }
    
    if (shouldAdjustY) {
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewport.height - 8) {
        top = viewport.height - tooltipRect.height - 8;
      }
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [visible, placement]);

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const defaultTooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.15s ease-in-out',
    backgroundColor: '#1D1E23',
    color: '#FFF',
    fontSize: '14px',
    lineHeight: '20px',
    fontFamily: 'Inter-Regular',
    borderRadius: '8px',
    padding: '12px 16px',
    boxShadow: '0px 12px 20px 0px rgba(0, 0, 0, 0.25)',
    maxWidth: '328px',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    ...overlayInnerStyle,
    ...overlayStyle,
    top: position.top,
    left: position.left
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}>
        {children}
      </div>
      {visible && !destroyTooltipOnHide && (
        <div ref={tooltipRef} style={defaultTooltipStyle}>
          {title}
        </div>
      )}
      {visible && destroyTooltipOnHide && (
        <div ref={tooltipRef} style={defaultTooltipStyle}>
          {title}
        </div>
      )}
    </>
  );
}