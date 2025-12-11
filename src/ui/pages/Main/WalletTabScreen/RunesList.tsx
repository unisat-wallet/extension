import { InfiniteList } from '@/ui/components';
import RunesBalanceCard from '@/ui/components/RunesBalanceCard';
import { useRunesListLogic } from '@unisat/wallet-state';

export function RunesList() {
  const { onRefresh, items, total, onLoadMore, onClickItem, loading, hasMore, priceMap } = useRunesListLogic();

  return (
    <InfiniteList
      data={items}
      total={total}
      keyExtractor={(item) => item.runeid}
      renderItem={({ item }) => {
        return (
          <RunesBalanceCard tokenBalance={item} price={priceMap[item.spacedRune]} onClick={() => onClickItem(item)} />
        );
      }}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
