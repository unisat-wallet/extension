import BigNumber from 'bignumber.js';
import { useState } from 'react';

import { AddressTokenSummary, TickPriceItem, TokenBalance } from '@/shared/types';
import { TickPriceChange, TickUsd } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import Tag from '../Tag';
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
    tokenBalance: { ticker, overallBalance, transferableBalance, selfMint, displayName, tag, swapBalance },
    onClick
  } = props;

  const account = useCurrentAccount();
  const [tokenSummary, setTokenSummary] = useState<AddressTokenSummary>();
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const { t } = useI18n();

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

  const onPizzaSwapBalance = swapBalance;
  const inWalletBalance = overallBalance;
  const totalBalance = onPizzaSwapBalance
    ? new BigNumber(inWalletBalance).plus(new BigNumber(onPizzaSwapBalance!)).toString()
    : inWalletBalance;

  return (
    <Card
      style={{
        backgroundColor: '#1E1F24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
      }}
      fullX
      onClick={() => {
        onClick && onClick();
      }}>
      <Column full py="zero" gap="zero">
        <Row fullY justifyBetween justifyCenter>
          <Column fullY justifyCenter>
            <Row>
              <BRC20Ticker tick={ticker} displayName={displayName} />
            </Row>
          </Column>

          <Row itemsCenter fullY gap="zero">
            <Text text={totalBalance} size="xs" digital />
          </Row>
        </Row>

        {showPrice && (
          <Row justifyBetween mt={'xs'}>
            <Row>
              {price && price.curPrice > 0 ? (
                <TickPriceChange price={price} />
              ) : (
                <Text text="$- " color="textDim" size="xs" />
              )}
            </Row>
            <Row>
              {price && price.curPrice > 0 ? (
                <TickUsd price={price} balance={totalBalance} />
              ) : (
                <Text text="$-" color="textDim" size="xs" />
              )}
            </Row>
          </Row>
        )}

        {(tag || selfMint) && (
          <Row mt={'sm'}>
            {tag && <Tag type={tag} />}
            {selfMint && <Tag type="self-issuance" />}
          </Row>
        )}
        {swapBalance ? (
          <Column>
            <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} mt="sm" />
            <Row fullY justifyBetween justifyCenter>
              <Column fullY justifyCenter>
                <Text text={t('brc20_in_wallet')} color="textDim" size="xs" />
              </Column>

              <Row itemsCenter fullY gap="zero">
                <Text text={inWalletBalance} size="xs" digital />
              </Row>
            </Row>

            <Row fullY justifyBetween justifyCenter>
              <Column fullY justifyCenter>
                <Text text={t('brc20_on_pizzaswap')} color="textDim" size="xs" />
              </Column>

              <Row itemsCenter fullY gap="zero">
                <Text text={onPizzaSwapBalance} size="xs" digital />
              </Row>
            </Row>
          </Column>
        ) : null}
      </Column>
    </Card>
  );
}
