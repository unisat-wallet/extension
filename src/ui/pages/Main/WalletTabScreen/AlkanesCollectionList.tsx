import { InfiniteList } from '@/ui/components';
import { AlkanesCollectionCard } from '@/ui/components/AlkanesCollectionCard';
import { useAlkanesCollectionListLogic, useDevice } from '@unisat/wallet-state';

export function AlkanesCollectionList() {
  const { onRefresh, items, total, onLoadMore, onClickItem, loading, hasMore } = useAlkanesCollectionListLogic();

  const device = useDevice();

  return (
    <InfiniteList
      data={items}
      total={total}
      numColumns={device.cardColumnsInList}
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
