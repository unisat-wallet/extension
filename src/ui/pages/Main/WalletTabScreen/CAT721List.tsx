import { useEffect, useState } from 'react';

import { CAT721Balance, CAT_VERSION } from '@/shared/types';
import { Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { CAT721CollectionCard } from '@/ui/components/CAT721CollectionCard';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useIsInExpandView, useSupportedAssets } from '@/ui/state/ui/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';

export function CAT721List(props: { version: CAT_VERSION }) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const { t } = useI18n();

  const [collections, setCollections] = useState<CAT721Balance[]>([]);
  const [total, setTotal] = useState(-1);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });

  const tools = useTools();

  const supportedAssets = useSupportedAssets();

  const inExpandView = useIsInExpandView();
  const justifyContent = inExpandView ? 'left' : 'space-between';

  useEffect(() => {
    const fetchData = async () => {
      if (!supportedAssets.assets.CAT20) {
        setCollections([]);
        setTotal(0);
        return;
      }
      try {
        const { list, total } = await wallet.getCAT721List(
          props.version,
          currentAccount.address,
          pagination.currentPage,
          pagination.pageSize
        );
        setCollections(list);
        setTotal(total);
      } catch (e) {
        setCollections([]);
        tools.toastError((e as Error).message);
      } finally {
        // tools.showLoading(false);
      }
    };

    fetchData();
  }, [pagination, currentAccount.address, chainType, supportedAssets.key, props.version]);

  if (total === -1) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <LoadingOutlined />
      </Column>
    );
  }

  if (total === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Empty text={t('empty')} />
      </Column>
    );
  }

  return (
    <Column>
      <Row style={{ flexWrap: 'wrap', justifyContent }} gap="sm">
        {collections.map((data, index) => (
          <CAT721CollectionCard
            version={props.version}
            key={index}
            cat721Balance={data}
            contentType={data.contentType}
            onClick={() => {
              navigate('CAT721CollectionScreen', {
                version: props.version,
                collectionId: data.collectionId
              });
            }}
          />
        ))}
      </Row>

      <Row justifyCenter mt="lg">
        <Pagination
          pagination={pagination}
          total={total}
          onChange={(pagination) => {
            setPagination(pagination);
          }}
        />
      </Row>
    </Column>
  );
}
