import { ReactEventHandler } from 'react';

import { AddressAssets } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToBTC } from '@/ui/utils';

import { Card } from '../Card';
import { Column } from '../Column';
import { CopyableAddress } from '../CopyableAddress';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

interface AddressTypeCardProps {
  label: string;
  address: string;
  checked: boolean;
  assets: AddressAssets;
  onClick?: ReactEventHandler<HTMLDivElement>;
}
export function AddressTypeCard(props: AddressTypeCardProps) {
  const btcUnit = useBTCUnit();
  const { onClick, label, address, checked, assets } = props;
  const hasVault = Boolean(assets.satoshis && assets.satoshis > 0);
  const { t } = useI18n();

  const chain = useChain();
  return (
    <Card px="zero" py="zero" gap="zero" rounded onClick={onClick}>
      <Column full>
        <Row justifyBetween px="md" pt="md">
          <Column justifyCenter>
            <Text text={label} size="xs" disableTranslate />
          </Column>
        </Row>
        <Row justifyBetween px="md" pb="md">
          <CopyableAddress address={address} />
          <Column justifyCenter>{checked && <Icon icon="check" />}</Column>
        </Row>
        {hasVault && (
          <Row justifyBetween bg="bg3" roundedBottom px="md" py="md">
            <Row justifyCenter>
              <Image src={chain.icon} size={fontSizes.iconMiddle} />
              <Text text={`${assets.total_btc} ${btcUnit}`} color="yellow" />
            </Row>
            <Row>
              {assets.total_inscription > 0 && (
                <Text text={`${assets.total_inscription} ${t('inscriptions_capital')}`} color="gold" preset="bold" />
              )}
            </Row>
          </Row>
        )}
      </Column>
    </Card>
  );
}

interface AddressTypeCardProp2 {
  label: string;
  items: {
    address: string;
    path: string;
    satoshis: number;
  }[];
  checked: boolean;
  onClick?: ReactEventHandler<HTMLDivElement>;
}

export function AddressTypeCard2(props: AddressTypeCardProp2) {
  const btcUnit = useBTCUnit();
  const { onClick, label, items, checked } = props;
  return (
    <Card px="zero" py="zero" gap="zero" rounded onClick={onClick}>
      <Column full>
        <Row justifyBetween px="md" pt="md">
          <Column justifyCenter>
            <Text text={label} size="xs" disableTranslate />
          </Column>
          <Column justifyCenter>{checked && <Icon icon="check" />}</Column>
        </Row>

        {items.map((v) => (
          <Row px="md" pb="sm" key={v.address} itemsCenter>
            <Row style={{ width: '120px' }}>
              <CopyableAddress address={v.address} />
            </Row>

            <Text text={`(${v.path})`} size="xs" color="textDim" disableTranslate />

            {v.satoshis > 0 && (
              <Row justifyCenter gap="zero" itemsCenter>
                <Icon icon="btc" size={fontSizes.iconMiddle} />
                <Text text={`${satoshisToBTC(v.satoshis)} ${btcUnit}`} color="yellow" size="xxxs" />
              </Row>
            )}
          </Row>
        ))}
      </Column>
    </Card>
  );
}
