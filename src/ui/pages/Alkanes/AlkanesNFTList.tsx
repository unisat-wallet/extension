import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { useAlkanesNFTListLogic, useDevice } from '@unisat/wallet-state';

import { InfiniteList } from '@/ui/components';

export function AlkanesNFTList(props: { collectionId: string }) {
  const { onRefresh, items, total, onLoadMore, onClickItem, loading, hasMore } = useAlkanesNFTListLogic(
    props.collectionId
  );

  const { cardColumnsInList } = useDevice();

  return (
    <InfiniteList
      data={items}
      total={total}
      numColumns={cardColumnsInList}
      renderItem={({ item }) => {
        return (
          <AlkanesNFTPreview key={item.alkaneid} preset="medium" alkanesInfo={item} onClick={() => onClickItem(item)} />
        );
      }}
      keyExtractor={(item) => item.alkaneid}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
