import { InfiniteList } from '@/ui/components';
import { AlkanesCollectionCard } from '@/ui/components/AlkanesCollectionCard';
import { useAlkanesCollectionListLogic } from '@unisat/wallet-state';

export function AlkanesCollectionList() {
  const { onRefresh, items, onLoadMore, onClickItem, loading, hasMore } = useAlkanesCollectionListLogic();

  return (
    <InfiniteList
      data={items}
      keyExtractor={(item) => item.alkaneid}
      renderItem={({ item, index }) => {
        return <AlkanesCollectionCard alkanesCollection={item} onClick={() => onClickItem(item)} />;
      }}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
