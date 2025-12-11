import { BRC20BalanceCardProps, useBRC20BalanceCardLogic } from '@unisat/wallet-state';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import Tag from '../Tag';
import { Text } from '../Text';
import { TokenBalanceIcon } from '../TokenBalanceIcon';
import { TokenBalancePrice } from '../TokenBalancePrice';

export default function BRC20BalanceCard(props: BRC20BalanceCardProps) {
  const {
    showPrice,
    price,
    ticker,
    iconInfo,
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
          <Column onClick={onClick}>
            <TokenBalanceIcon iconInfo={iconInfo} />
          </Column>

          <Column justifyCenter style={{ marginRight: 'auto' }} gap="zero">
            <BRC20Ticker tick={ticker} displayName={displayName} />
            {(tag || selfMint) && (
              <Row>
                {tag && <Tag type={tag} />}
                {selfMint && <Tag type="self-issuance" small />}
              </Row>
            )}
          </Column>

          <Row itemsCenter fullY gap="zero">
            <Text text={totalBalance} size="xs" digital />
          </Row>
        </Row>

        <TokenBalancePrice showPrice={showPrice} price={price} balance={totalBalance} />

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
