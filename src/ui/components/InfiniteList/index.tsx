import { spacing } from '@/ui/theme/spacing';
import { LoadingOutlined } from '@ant-design/icons';
import { useI18n } from '@unisat/wallet-state';
import InfiniteScroll from 'react-infinite-scroll-component';
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
  scrollContainerId?: string; // plugin 用
  numColumns?: number; // future use
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
  scrollContainerId = 'scrollableDiv',
  numColumns = 1
}: InfiniteListProps<T>) {
  const isMultiColumn = numColumns > 1;

  const { t } = useI18n();
  return (
    <div
      id={scrollContainerId}
      style={{
        height,
        overflow: 'auto',
        ...style
      }}>
      <InfiniteScroll
        dataLength={data.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <Row justifyCenter mt="md">
            <LoadingOutlined style={{ color: '#ffde04' }} />
          </Row>
        }
        endMessage={
          !loading &&
          data.length == 0 && (
            <Row justifyCenter mt="md" mb="md">
              <Empty />
            </Row>
          )
        }
        scrollableTarget={scrollContainerId}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={onRefresh}>
        {isMultiColumn ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
              columnGap: spacing.small,
              rowGap: spacing.extraSmall
            }}>
            {data.map((item, index) => (
              <div key={keyExtractor(item, index)}>{renderItem({ item, index })}</div>
            ))}
          </div>
        ) : (
          data.map((item, index) => (
            <div key={keyExtractor(item, index)} style={{ marginBottom: spacing.extraSmall }}>
              {renderItem({ item, index })}
            </div>
          ))
        )}
      </InfiniteScroll>
    </div>
  );
}
