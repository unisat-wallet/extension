import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';

import { BaseView, BaseViewProps } from '../BaseView';
import { Column, Row, Text } from '../index';
import './index.css';

interface ScrollableListProps extends BaseViewProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  maxVisibleItems?: number;
  showScrollIndicator?: boolean;
  showJumpButtons?: boolean;
  emptyText?: string;
  itemHeight?: number;
}

export function ScrollableList({
  items,
  renderItem,
  maxVisibleItems = 5,
  showScrollIndicator = true,
  showJumpButtons = true,
  emptyText = 'No items',
  itemHeight = 60,
  style,
  ...props
}: ScrollableListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollToTop, setCanScrollToTop] = useState(false);
  const [canScrollToBottom, setCanScrollToBottom] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const { t } = useI18n();

  const shouldScroll = items.length > maxVisibleItems;
  const maxHeight = shouldScroll ? itemHeight * maxVisibleItems : 'auto';

  const checkScrollPosition = () => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    setCanScrollToTop(scrollTop > 10);
    setCanScrollToBottom(scrollTop < scrollHeight - clientHeight - 10);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    setIsScrolling(true);
    checkScrollPosition();

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    const newTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    setScrollTimeout(newTimeout);
  };

  useEffect(() => {
    checkScrollPosition();

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [items.length, scrollTimeout]);

  if (items.length === 0) {
    return (
      <Column justifyCenter itemsCenter style={{ minHeight: '60px', ...style }}>
        <Text text={emptyText} color="textDim" />
      </Column>
    );
  }

  return (
    <Column style={style} {...props}>
      {showScrollIndicator && shouldScroll && (
        <Row justifyBetween itemsCenter mb="sm">
          <Text
            text={`${items.length} ${t('scroll_view_items')}${shouldScroll ? ` - ${t('scroll_to_view_all')}` : ''}`}
            size="xs"
            color="textDim"
          />
          {showJumpButtons && (
            <div
              style={{
                width: '120px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '8px'
              }}>
              {canScrollToTop && (
                <BaseView
                  onClick={scrollToTop}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: colors.bg4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                  <Text text={t('scroll_to_top')} size="xs" color="white" />
                </BaseView>
              )}

              {canScrollToBottom && (
                <BaseView
                  onClick={scrollToBottom}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: colors.bg4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                  <Text text={t('scroll_to_bottom')} size="xs" color="white" />
                </BaseView>
              )}
            </div>
          )}
        </Row>
      )}

      <div
        ref={scrollRef}
        className={shouldScroll ? 'scrollable-list-container' : ''}
        style={{
          maxHeight,
          position: 'relative',
          scrollBehavior: 'smooth',
          display: 'flex',
          flexDirection: 'column',
          ...(!shouldScroll && { overflow: 'visible' }),
          ...(shouldScroll && {
            overflowY: 'auto' as const,
            paddingRight: '4px'
          })
        }}
        onScroll={handleScroll}>
        <Column gap="lg">
          {items.map((item, index) => (
            <div key={index}>{renderItem(item, index)}</div>
          ))}
        </Column>

        {isScrolling && shouldScroll && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '20px',
              height: '100%',
              background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
      </div>
    </Column>
  );
}

declare global {
  interface Window {
    scrollTimeout: number;
  }
}
