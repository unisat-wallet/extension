import { useEffect, useState } from 'react';

import { CAT20Balance, TickPriceItem } from '@/shared/types';
import { Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { CAT20BalanceCard } from '@/ui/components/CAT20BalanceCard';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChain, useChainType } from '@/ui/state/settings/hooks';
import { useSupportedAssets } from '@/ui/state/ui/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';

export function CAT20List() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const chain = useChain();
  const { t } = useI18n();

  const [tokens, setTokens] = useState<CAT20Balance[]>([]);
  const [total, setTotal] = useState(-1);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });

  const tools = useTools();

  const supportedAssets = useSupportedAssets();

  const [priceMap, setPriceMap] = useState<{ [key: string]: TickPriceItem }>();
  useEffect(() => {
    const fetchData = async () => {
      if (!supportedAssets.assets.CAT20) {
        setTokens([]);
        setTotal(0);
        return;
      }
      try {
        setPriceMap(undefined);
        const { list, total } = await wallet.getCAT20List(
          currentAccount.address,
          pagination.currentPage,
          pagination.pageSize
        );
        setTokens(list);
        setTotal(total);
        if (list.length > 0) {
          wallet.getCAT20sPrice(list.map((item) => item.tokenId)).then(setPriceMap);
        }
      } catch (e) {
        tools.toastError((e as Error).message);
      } finally {
        // tools.showLoading(false);
      }
    };

    fetchData();
  }, [pagination, currentAccount.address, chainType, supportedAssets.key]);

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
      <Row style={{ flexWrap: 'wrap' }} gap="sm">
        {tokens.map((data, index) => (
          <CAT20BalanceCard
            key={index}
            tokenBalance={data}
            showPrice={chain.showPrice && priceMap !== undefined}
            price={priceMap?.[data.tokenId]}
            onClick={() => {
              navigate('CAT20TokenScreen', {
                tokenId: data.tokenId
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
