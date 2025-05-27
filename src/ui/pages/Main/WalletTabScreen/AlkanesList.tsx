import { useEffect, useState } from 'react';

import { AlkanesBalance, TickPriceItem } from '@/shared/types';
import { Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import AlkanesBalanceCard from '@/ui/components/AlkanesBalanceCard';
import { Empty } from '@/ui/components/Empty';
import { Pagination } from '@/ui/components/Pagination';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';

export function AlkanesList() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const { t } = useI18n();

  const [tokens, setTokens] = useState<AlkanesBalance[]>([]);
  const [total, setTotal] = useState(-1);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });
  const [priceMap, setPriceMap] = useState<{ [key: string]: TickPriceItem }>();

  const tools = useTools();
  const fetchData = async () => {
    try {
      const { list, total } = await wallet.getAlkanesList(
        currentAccount.address,
        pagination.currentPage,
        pagination.pageSize
      );
      setTokens(list);
      setTotal(total);
      if (list.length > 0) {
        // wallet.getRunesPrice(list.map((item) => item.spacedRune)).then(setPriceMap);
      }
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      // tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, currentAccount.address, chainType]);

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
          <AlkanesBalanceCard
            key={index}
            tokenBalance={data}
            showPrice={priceMap !== undefined}
            onClick={() => {
              navigate('AlkanesTokenScreen', {
                alkaneid: data.alkaneid
              });
            }}
          />
        ))}
      </Row>

      {tokens.length > 0 ? (
        <Row justifyCenter mt="lg">
          <Pagination
            pagination={pagination}
            total={total}
            onChange={(pagination) => {
              setPagination(pagination);
            }}
          />
        </Row>
      ) : (
        <Empty text={t('empty')} />
      )}
    </Column>
  );
}
