import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Column, Row } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { LoadingOutlined } from '@ant-design/icons';

export interface VirtualListProps<T> {
  // Current account address
  address: string;
  // Current chain type
  chainType: string;
  // Function to fetch data
  fetchData: (address: string, page: number, pageSize: number) => Promise<{ list: T[]; total: number }>;
  // Function to render each item
  renderItem: (item: T, index: number) => ReactNode;
  // Number of items per row
  itemsPerRow?: number;
  // Initial page size
  pageSize?: number;
  // Error handler
  onError?: (error: Error) => void;
  // Empty state message
  emptyText?: string;
  // Container height (undefined means auto height)
  containerHeight?: number;
}

export function VirtualList<T>({
  address,
  chainType,
  fetchData,
  renderItem,
  itemsPerRow = 2,
  pageSize,
  onError,
  emptyText = 'Empty'
}: VirtualListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(-1);
  const isInTab = useExtensionIsInTab();
  const effectivePageSize = pageSize || (isInTab ? 50 : 20);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: effectivePageSize });
  const prevIsInTabRef = useRef(isInTab);
  const prevPageSizeRef = useRef(pagination.pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevChainTypeRef = useRef<string | null>(null);
  const chainChangedRef = useRef(false);

  useEffect(() => {
    const hasViewModeChanged = prevIsInTabRef.current !== isInTab;
    prevIsInTabRef.current = isInTab;

    if (hasViewModeChanged) {
      const newPageSize = pageSize || (isInTab ? 50 : 20);

      if (prevPageSizeRef.current !== newPageSize) {
        prevPageSizeRef.current = newPageSize;
        setPagination({ currentPage: 1, pageSize: newPageSize });

        if (address) {
          setIsLoading(true);
          isLoadingRef.current = true;

          fetchData(address, 1, newPageSize)
            .then(({ list, total }) => {
              setItems(list);
              setTotal(total);
            })
            .catch((e) => {
              if (onError && e instanceof Error) {
                onError(e);
              }
            })
            .finally(() => {
              setIsLoading(false);
              isLoadingRef.current = false;
            });
        }
      }
    }
  }, [isInTab, address, fetchData, onError, pageSize]);

  const loadData = useCallback(async () => {
    if (!address || isLoadingRef.current) return;

    if (chainChangedRef.current) {
      chainChangedRef.current = false;
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const { list, total } = await fetchData(address, pagination.currentPage, pagination.pageSize);
      setItems(list);
      setTotal(total);
    } catch (e) {
      if (onError && e instanceof Error) {
        onError(e);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [address, pagination, fetchData, onError]);

  useEffect(() => {
    if (prevChainTypeRef.current !== chainType) {
      chainChangedRef.current = true;

      setPagination({ currentPage: 1, pageSize: effectivePageSize });
      setItems([]);
      setTotal(-1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      if (!isLoadingRef.current && address) {
        isLoadingRef.current = true;
        setIsLoading(true);

        fetchData(address, 1, effectivePageSize)
          .then(({ list, total }) => {
            setItems(list);
            setTotal(total);
          })
          .catch((e) => {
            if (onError && e instanceof Error) {
              onError(e);
            }
          })
          .finally(() => {
            setIsLoading(false);
            isLoadingRef.current = false;
            chainChangedRef.current = false;
          });
      }
    }

    prevChainTypeRef.current = chainType;
  }, [chainType, address, effectivePageSize, fetchData, onError]);

  useEffect(() => {
    loadData();
  }, [pagination, address, loadData]);

  const gridRows = useMemo(() => {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += itemsPerRow) {
      rows.push(items.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [items, itemsPerRow]);

  if (total === -1) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <LoadingOutlined />
      </Column>
    );
  }

  if (total === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Empty text={emptyText} />
      </Column>
    );
  }

  return (
    <Column>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          touchAction: 'pan-y',
          width: '100%',
          overflowX: 'hidden'
        }}>
        {isLoading && (
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
                gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                gap: '8px',
                justifyContent: 'center'
              }}>
              {row.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                  {renderItem(item, index)}
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
          onChange={(pagination) => {
            setPagination(pagination);
          }}
        />
      </Row>
    </Column>
  );
}
