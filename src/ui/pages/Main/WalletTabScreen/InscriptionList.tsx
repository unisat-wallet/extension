import { InfiniteList } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useDevice, useInscriptionListLogic } from '@unisat/wallet-state';

export function InscriptionList() {
  const { onRefresh, items, total, onLoadMore, onClickItem, loading, hasMore } = useInscriptionListLogic();

  const device = useDevice();
  return (
    <InfiniteList
      data={items}
      total={total}
      numColumns={device.cardColumnsInList}
      keyExtractor={(item) => item.inscriptionId}
      renderItem={({ item, index }) => {
        return (
          <InscriptionPreview
            key={item.inscriptionId || `inscription-${index}`}
            data={item}
            preset="medium"
            onClick={() => onClickItem(item)}
          />
        );
      }}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
