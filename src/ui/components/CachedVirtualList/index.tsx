import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Column, Row } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { LoadingOutlined } from '@ant-design/icons';

// Generic cache structure
interface DataCache<T> {
  [key: string]: {
    items: T[];
    total: number;
    timestamp: number;
  };
}

// Global cache object
const globalCache: Record<string, DataCache<any>> = {};

export interface CachedListProps<T> {
  // Unique namespace for this list type (e.g. 'inscriptions', 'tokens', etc.)
  namespace: string;
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
  // Cache expiration time in milliseconds
  cacheExpiration?: number;
  // Error handler
  onError?: (error: Error) => void;
  // Empty state message
  emptyText?: string;
  // Container height (undefined means auto height)
  containerHeight?: number;
}

// Custom event for data loaded
const dispatchDataLoadedEvent = <T,>(namespace: string, items: T[]) => {
  const event = new CustomEvent(`cachedList:${namespace}:dataLoaded`, {
    detail: { items }
  });
  window.dispatchEvent(event);
};

export function CachedList<T>({
  namespace,
  address,
  chainType,
  fetchData,
  renderItem,
  itemsPerRow = 2,
  pageSize,
  cacheExpiration = 3 * 60 * 1000, // 3 minutes default
  onError,
  emptyText = 'Empty'
}: CachedListProps<T>) {
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

  useEffect(() => {
    const hasViewModeChanged = prevIsInTabRef.current !== isInTab;
    prevIsInTabRef.current = isInTab;

    if (hasViewModeChanged) {
      const newPageSize = pageSize || (isInTab ? 50 : 20);

      if (prevPageSizeRef.current !== newPageSize) {
        prevPageSizeRef.current = newPageSize;

        setPagination({ currentPage: 1, pageSize: newPageSize });

        if (globalCache[namespace]) {
          Object.keys(globalCache[namespace]).forEach((key) => {
            delete globalCache[namespace][key];
          });
        }

        if (address) {
          setIsLoading(true);
          isLoadingRef.current = true;

          fetchData(address, 1, newPageSize)
            .then(({ list, total }) => {
              const cacheKey = `${address}_${chainType}_1_${newPageSize}`;
              globalCache[namespace][cacheKey] = {
                items: list,
                total,
                timestamp: Date.now()
              };

              setItems(list);
              setTotal(total);
              dispatchDataLoadedEvent(namespace, list);
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
  }, [isInTab, address, namespace, chainType, fetchData, onError, pageSize]);

  // Initialize namespace cache if not exists
  if (!globalCache[namespace]) {
    globalCache[namespace] = {};
  }

  // Get current cache key
  const getCacheKey = useCallback(
    (page: number) => {
      return `${address}_${chainType}_${page}_${pagination.pageSize}`;
    },
    [address, chainType, pagination.pageSize]
  );

  // Check if cache is valid
  const isCacheValid = useCallback(
    (cacheEntry: { timestamp: number }) => {
      return Date.now() - cacheEntry.timestamp < cacheExpiration;
    },
    [cacheExpiration]
  );

  const loadData = useCallback(async () => {
    if (!address || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    const cacheKey = getCacheKey(pagination.currentPage);
    const cachedData = globalCache[namespace][cacheKey];

    if (cachedData && isCacheValid(cachedData)) {
      setItems(cachedData.items);
      setTotal(cachedData.total);
      setIsLoading(false);
      isLoadingRef.current = false;

      // Dispatch data loaded event
      dispatchDataLoadedEvent(namespace, cachedData.items);
      return;
    }

    try {
      const { list, total } = await fetchData(address, pagination.currentPage, pagination.pageSize);

      globalCache[namespace][cacheKey] = {
        items: list,
        total,
        timestamp: Date.now()
      };

      setItems(list);
      setTotal(total);

      dispatchDataLoadedEvent(namespace, list);
    } catch (e) {
      if (onError && e instanceof Error) {
        onError(e);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [address, chainType, pagination, namespace, getCacheKey, isCacheValid, fetchData, onError]);

  // Clear cache when account or chain type changes
  useEffect(() => {
    if (prevChainTypeRef.current !== null && prevChainTypeRef.current !== chainType) {
      setPagination({ currentPage: 1, pageSize: effectivePageSize });
      setItems([]);
      setTotal(-1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      Object.keys(globalCache[namespace]).forEach((key) => {
        delete globalCache[namespace][key];
      });

      fetchData(address, 1, effectivePageSize)
        .then(({ list, total }) => {
          setItems(list);
          setTotal(total);
        })
        .catch((e) => {
          if (onError && e instanceof Error) {
            onError(e);
          }
        });
    }

    prevChainTypeRef.current = chainType;
  }, [chainType, address, namespace, effectivePageSize, fetchData, onError]);

  useEffect(() => {
    if (prevChainTypeRef.current === chainType) {
      loadData();
    }
  }, [pagination, address, loadData, chainType]);

  // Create grid rows
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
