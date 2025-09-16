import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '@/ui/theme/colors';
import { Row } from '@/ui/components';

interface CarouselProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  showDots?: boolean;
  showArrows?: boolean;
  style?: CSSProperties;
}

const $carouselContainer: CSSProperties = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: 8
};

const $carouselWrapper: CSSProperties = {
  display: 'flex',
  transition: 'transform 0.5s ease-in-out',
  width: '100%'
};

const $carouselSlide: CSSProperties = {
  minWidth: '100%',
  flex: '0 0 100%'
};

const $dotsContainer: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 16,
  gap: 8
};

const $dot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: colors.white_muted,
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const $dotActive: CSSProperties = {
  ...$dot,
  backgroundColor: colors.yellow,
  width: 10,
  height: 10
};

const $arrowButton: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: colors.white,
  border: 'none',
  borderRadius: 4,
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  fontSize: 16,
  transition: 'all 0.3s ease'
};

const $leftArrow: CSSProperties = {
  ...$arrowButton,
  left: 8
};

const $rightArrow: CSSProperties = {
  ...$arrowButton,
  right: 8
};

export function Carousel({ 
  children, 
  autoplay = false, 
  autoplaySpeed = 3000,
  showDots = true,
  showArrows = false,
  style = {}
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = React.Children.count(children);

  // Auto play functionality
  useEffect(() => {
    if (autoplay && !isHovered && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
      }, autoplaySpeed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, autoplaySpeed, isHovered, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  }, [totalSlides]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (totalSlides === 0) {
    return null;
  }

  if (totalSlides === 1) {
    return (
      <div style={{ ...style }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ ...style }}>
      <div 
        style={$carouselContainer}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          style={{
            ...$carouselWrapper,
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} style={$carouselSlide}>
              {child}
            </div>
          ))}
        </div>

        {showArrows && (
          <>
            <button 
              style={$leftArrow}
              onClick={goToPrevious}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              ←
            </button>
            <button 
              style={$rightArrow}
              onClick={goToNext}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              →
            </button>
          </>
        )}
      </div>

      {showDots && (
        <Row style={$dotsContainer}>
          {React.Children.map(children, (_, index) => (
            <div
              key={index}
              style={index === currentIndex ? $dotActive : $dot}
              onClick={() => goToSlide(index)}
              onMouseOver={(e) => {
                if (index !== currentIndex) {
                  (e.target as HTMLElement).style.backgroundColor = colors.white;
                }
              }}
              onMouseOut={(e) => {
                if (index !== currentIndex) {
                  (e.target as HTMLElement).style.backgroundColor = colors.white_muted;
                }
              }}
            />
          ))}
        </Row>
      )}
    </div>
  );
}