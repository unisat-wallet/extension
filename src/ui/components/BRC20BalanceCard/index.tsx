import { TickPriceChange, TickUsd } from '@/ui/components/TickUsd';
import { BRC20BalanceCardProps, useBRC20BalanceCardLogic } from '@unisat/wallet-state';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import Tag from '../Tag';
import { Text } from '../Text';

export default function BRC20BalanceCard(props: BRC20BalanceCardProps) {
  const {
    showPrice,
    price,
    ticker,
    displayName,
    tag,
    onClick,
    totalBalance,
    selfMint,
    onProgBalance,
    hasOutWalletBalance,
    inWalletBalance,
    onSwapBalance,
    t
  } = useBRC20BalanceCardLogic(props);

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
        {hasOutWalletBalance ? (
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

            {onSwapBalance ? (
              <Row fullY justifyBetween justifyCenter>
                <Column fullY justifyCenter>
                  <Text text={t('brc20_on_swap')} color="textDim" size="xs" />
                </Column>

                <Row itemsCenter fullY gap="zero">
                  <Text text={onSwapBalance} size="xs" digital />
                </Row>
              </Row>
            ) : null}

            {onProgBalance ? (
              <Row fullY justifyBetween justifyCenter>
                <Column fullY justifyCenter>
                  <Text text={t('brc20_on_prog')} color="textDim" size="xs" />
                </Column>

                <Row itemsCenter fullY gap="zero">
                  <Text text={onProgBalance} size="xs" digital />
                </Row>
              </Row>
            ) : null}
          </Column>
        ) : null}
      </Column>
    </Card>
  );
}
