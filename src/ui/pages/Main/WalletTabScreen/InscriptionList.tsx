import { InfiniteList } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useDevice, useInscriptionListLogic } from '@unisat/wallet-state';
import { useEffect, useMemo, useState } from 'react';

export function InscriptionList() {
  const { onRefresh, items, onLoadMore, onClickItem, loading, hasMore } = useInscriptionListLogic();
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const device = useDevice();

  const numColums = useMemo(() => {
    if (device.isExtensionInExpandView) {
      return Math.ceil(width / 180);
    } else {
      return 2;
    }
  }, [device.isExtensionInExpandView, width]);

  useEffect(() => {
    const el = document.getElementById('layoutScrollId');
    console.log('layout loaded', el);

    if (!el) return;

    const handler = () => console.log('scrolling…');

    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <InfiniteList
      data={items}
      numColumns={numColums}
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
