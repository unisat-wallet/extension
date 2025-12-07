import { InfiniteList } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useInscriptionListLogic } from '@unisat/wallet-state';

export function InscriptionList() {
  const { onRefresh, items, onLoadMore, onClickItem, loading, hasMore } = useInscriptionListLogic();

  return (
    <InfiniteList
      data={items}
      numColumns={2}
      keyExtractor={(item) => item.inscriptionId}
      renderItem={({ item, index }) => {
        return (
          <InscriptionPreview
            key={item.inscriptionId || `inscription-${index}`}
            data={item}
            style={{ width: '100%' }}
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
