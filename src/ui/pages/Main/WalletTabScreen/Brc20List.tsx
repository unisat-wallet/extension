import { InfiniteList } from '@/ui/components';
import BRC20BalanceCard from '@/ui/components/BRC20BalanceCard';
import { useBRC20ListLogic } from '@unisat/wallet-state';

export function BRC20List() {
  const { onRefresh, total, items, onLoadMore, onClickItem, loading, hasMore, priceMap } = useBRC20ListLogic();

  return (
    <InfiniteList
      data={items}
      total={total}
      keyExtractor={(item) => item.ticker}
      renderItem={({ item }) => {
        return <BRC20BalanceCard tokenBalance={item} price={priceMap[item.ticker]} onClick={() => onClickItem(item)} />;
      }}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
