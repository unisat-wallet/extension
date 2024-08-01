import { useState } from 'react';

import { AddressTokenSummary, TickPriceItem, TokenBalance } from '@/shared/types';
import { TickPriceChange, TickUsd } from '@/ui/components/TickUsd';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20BalanceCard2Props {
    tokenBalance: TokenBalance;
    onClick?: () => void;
    showPrice?: boolean;
    price?: TickPriceItem;
}

export default function BRC20BalanceCard2(props: BRC20BalanceCard2Props) {
    const {
        showPrice,
        price,
        tokenBalance: {
            ticker,
            overallBalance,
            transferableBalance,
            availableBalance,
            availableBalanceSafe,
            availableBalanceUnSafe
        },
        onClick
    } = props;

    const account = useCurrentAccount();
    const [detailVisible, setDetailVisible] = useState(false);
    const [tokenSummary, setTokenSummary] = useState<AddressTokenSummary>();
    const [loading, setLoading] = useState(false);
    const wallet = useWallet();

    const deploy_count = tokenSummary ? (tokenSummary.tokenInfo.holder == account.address ? 1 : 0) : 0;
    let _names: string[] = [];
    const _amounts: string[] = [];
    if (deploy_count > 0) {
        _names.push('Deploy');
        _amounts.push('');
    }
    if (tokenSummary) {
        tokenSummary.transferableList.forEach((v) => {
            _names.push('Transfer');
            _amounts.push(v.amount);
        });
    }

    for (let i = 0; i < _names.length; i++) {
        if (i == 3) {
            if (_names.length > 4) {
                if (deploy_count > 0) {
                    _names[i] = `${_names.length - 3}+`;
                } else {
                    _names[i] = `${_names.length - 2}+`;
                }
                _amounts[i] = '';
            }
            break;
        }
    }
    _names = _names.splice(0, 4);

    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }}
            fullX
            onClick={() => {
                onClick && onClick();
            }}>
            <Column full py="zero" gap="zero">
                <Row fullY justifyBetween justifyCenter>
                    <Column fullY justifyCenter>
                        <BRC20Ticker tick={ticker} />
                    </Column>

                    <Row itemsCenter fullY gap="zero">
                        <Text text={overallBalance} size="xs" digital />
                        <Row style={{ width: 30, height: 20 }} itemsCenter justifyCenter>
                            <Icon
                                icon={detailVisible ? 'up' : 'down'}
                                onClick={(e) => {
                                    setDetailVisible(!detailVisible);
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();

                                    if (loading) {
                                        return;
                                    }
                                    if (!tokenSummary) {
                                        setLoading(true);
                                        wallet
                                            .getBRC20Summary(account.address, ticker)
                                            .then((tokenSummary) => {
                                                setTokenSummary(tokenSummary);
                                            })
                                            .finally(() => {
                                                setLoading(false);
                                            });
                                    }
                                }}
                                size={10}
                                color="textDim"></Icon>
                        </Row>
                    </Row>
                </Row>
                {showPrice && (
                    <Row justifyBetween mt={'xs'}>
                        <TickPriceChange price={price} />
                        <TickUsd price={price} balance={overallBalance} />
                    </Row>
                )}
                {detailVisible ? (
                    loading ? (
                        <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
                            <Icon>
                                <LoadingOutlined />
                            </Icon>
                        </Column>
                    ) : (
                        <Column>
                            <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} mt="sm" />
                            <Row justifyBetween>
                                <Text text="Transferable:" color="textDim" size="xs" />
                                <Text text={transferableBalance} size="xs" digital />
                            </Row>
                            <Column>
                                <Row>
                                    {_names.map((v, index) => (
                                        <Card
                                            key={'transfer_' + index}
                                            style={{ width: 68, height: 68 }}
                                            bg={
                                                v === 'Transfer'
                                                    ? 'brc20_transfer'
                                                    : v === 'Deploy'
                                                    ? 'brc20_deploy'
                                                    : 'brc20_other'
                                            }>
                                            <Column gap="zero">
                                                <Text
                                                    text={v}
                                                    size={v === 'Transfer' ? 'sm' : v === 'Deploy' ? 'sm' : 'md'}
                                                />
                                                {v === 'Transfer' ? (
                                                    <Text
                                                        text={`(${_amounts[index]})`}
                                                        size="xxs"
                                                        textCenter
                                                        wrap
                                                        digital
                                                    />
                                                ) : null}
                                            </Column>
                                        </Card>
                                    ))}
                                </Row>
                            </Column>
                        </Column>
                    )
                ) : null}
            </Column>
        </Card>
    );
}
