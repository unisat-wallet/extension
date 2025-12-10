import { spacing } from '@/ui/theme/spacing';
import { List, Spin } from 'antd';
import { useEffect, useRef } from 'react';
import { Empty } from '../Empty';
import { Row } from '../Row';

interface InfiniteListProps<T> {
  data: T[];
  renderItem: (item: { item: T; index: number }) => JSX.Element;
  keyExtractor: (item: T, index: number) => string;
  onLoadMore: () => void;
  onRefresh: () => void;
  hasMore: boolean;
  loading: boolean;
  height?: number | string;
  style?: any;
  numColumns?: number;
}

export function InfiniteList<T>({
  data,
  renderItem,
  keyExtractor,
  onLoadMore,
  onRefresh,
  hasMore,
  loading,
  height = '100%',
  style,
  numColumns = 1
}: InfiniteListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ------------ Pull to Refresh  ------------
  const touchStartY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        pulling.current = true;
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const diff = e.touches[0].clientY - touchStartY.current;

      if (diff > 60) {
        pulling.current = false;
        onRefresh();
      }
    };

    const onTouchEnd = () => {
      pulling.current = false;
    };

    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh]);

  // ------------ Infinite Scroll  ------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!hasMore || loading) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasMore, loading, onLoadMore]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        ...style
      }}>
      <List
        dataSource={data}
        locale={{ emptyText: 'Empty' }}
        grid={numColumns > 1 ? { gutter: spacing.small, column: numColumns } : undefined}
        renderItem={(item, index) => (
          <List.Item key={keyExtractor(item, index)}>{renderItem({ item, index })}</List.Item>
        )}
      />

      {loading && hasMore && (
        <Row justifyCenter mt="md">
          <Spin />
        </Row>
      )}

      {!loading && data.length === 0 && (
        <Row justifyCenter mt="md" mb="md">
          <Empty />
        </Row>
      )}
    </div>
  );
}
