import { useEffect, useState } from 'react';

import { Inscription } from '@/shared/types';
import { Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Empty } from '@/ui/components/Empty';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { Pagination } from '@/ui/components/Pagination';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';

export function InscriptionList() {
    const navigate = useNavigate();
    const wallet = useWallet();
    const currentAccount = useCurrentAccount();
    const chainType = useChainType();
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [total, setTotal] = useState(-1);
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });

    const tools = useTools();

    const fetchData = async () => {
        try {
            // tools.showLoading(true);
            const { list, total } = await wallet.getOrdinalsInscriptions(
                currentAccount.address,
                pagination.currentPage,
                pagination.pageSize
            );
            setInscriptions(list);
            setTotal(total);
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
                <Empty text="Empty" />
            </Column>
        );
    }

    return (
        <Column>
            <Row style={{ flexWrap: 'wrap' }} gap="lg">
                {inscriptions.map((data, index) => (
                    <InscriptionPreview
                        key={index}
                        data={data}
                        preset="medium"
                        onClick={() => {
                            navigate('OrdinalsInscriptionScreen', { inscription: data, withSend: true });
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
