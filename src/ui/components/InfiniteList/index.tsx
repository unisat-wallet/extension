import { useEffect, useMemo, useRef, useState } from 'react';

import { Column, Row } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { LoadingOutlined } from '@ant-design/icons';

interface InfiniteListProps<T> {
  data: T[];
  renderItem: (item: { item: T; index: number }) => JSX.Element;
  keyExtractor: (item: T, index: number) => string;
  onLoadMore: () => void;
  onRefresh: () => void;
  hasMore: boolean;
  loading: boolean;
  height?: number | string;
  numColumns?: number;
  total: number;
}

export function InfiniteList<T>({
  data,
  total,
  renderItem,
  keyExtractor,
  onLoadMore,
  onRefresh,
  hasMore,
  loading,
  height,
  numColumns = 1
}: InfiniteListProps<T>) {
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  const pageData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = pagination.currentPage * pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination]);

  useEffect(() => {
    if (pageData.length < pagination.pageSize && hasMore && !loading) {
      onLoadMore();
    }
  }, [pagination, data.length]);

  useEffect(() => {
    setPagination({ currentPage: 1, pageSize: pagination.pageSize });
  }, [total]);

  const gridRows = useMemo(() => {
    const rows: T[][] = [];
    for (let i = 0; i < pageData.length; i += numColumns) {
      rows.push(pageData.slice(i, i + numColumns));
    }
    return rows;
  }, [pageData, numColumns]);

  if (!loading && data.length === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Empty text="Empty" />
      </Column>
    );
  }

  return (
    <Column>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: height || 'auto',
          overflowY: height ? 'auto' : 'visible'
        }}>
        {loading && (
          <Row justifyCenter style={{ position: 'absolute', width: '100%', zIndex: 10, padding: '10px 0' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '8px 12px', borderRadius: '4px' }}>
              <LoadingOutlined style={{ color: '#ffde04' }} />
            </div>
          </Row>
        )}

        <div style={{ width: '100%', padding: '0 4px' }}>
          {gridRows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              style={{
                width: '100%',
                marginBottom: '12px',
                display: 'grid',
                gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                gap: '8px'
              }}>
              {row.map((item, idx) => (
                <div key={keyExtractor(item, idx)} style={{ width: '100%' }}>
                  {renderItem({ item, index: idx })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Row justifyCenter mt="lg">
        <Pagination
          pagination={pagination}
          total={total}
          onChange={(p) => {
            setPagination(p);
          }}
        />
      </Row>
    </Column>
  );
}
