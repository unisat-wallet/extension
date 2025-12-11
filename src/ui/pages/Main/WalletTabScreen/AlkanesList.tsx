import { InfiniteList } from '@/ui/components';
import AlkanesBalanceCard from '@/ui/components/AlkanesBalanceCard';
import { useAlkanesListLogic } from '@unisat/wallet-state';

export function AlkanesList() {
  const { onRefresh, items, total, onLoadMore, onClickItem, loading, hasMore, priceMap } = useAlkanesListLogic();

  return (
    <InfiniteList
      data={items}
      total={total}
      keyExtractor={(item) => item.alkaneid}
      renderItem={({ item }) => {
        return (
          <AlkanesBalanceCard tokenBalance={item} price={priceMap[item.alkaneid]} onClick={() => onClickItem(item)} />
        );
      }}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
