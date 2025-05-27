import { useCallback } from 'react';

import { AlkanesCollection } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';

import { Column } from '../Column';
import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

export interface AlkanesCollectionCardProps {
  alkanesCollection: AlkanesCollection;
  onClick?: () => void;
}

function CardComponent(props: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Row
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        width: 158,
        height: 158,
        borderRadius: 16,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center'
      }}
      itemsCenter
      gap="zero"
      py="zero"
      onClick={() => {
        props.onClick && props.onClick();
      }}>
      {props.children}
    </Row>
  );
}

export function AlkanesCollectionCard(props: AlkanesCollectionCardProps) {
  const { alkanesCollection, onClick } = props;
  const { t } = useI18n();

  const renderItem = useCallback(
    (key: string, size: number) => {
      if (alkanesCollection.image) {
        return (
          <Image
            key={key}
            src={alkanesCollection.image}
            width={size}
            height={size}
            style={{
              borderRadius: 8,
              margin: 4
            }}
          />
        );
      } else {
        return (
          <Row>
            <Text text={alkanesCollection.name} size="xs" color="textDim" />
          </Row>
        );
      }
    },
    [alkanesCollection.alkaneid]
  );

  return (
    <Column>
      <CardComponent onClick={onClick}>{renderItem(alkanesCollection.alkaneid, 142)}</CardComponent>

      <Column justifyBetween justifyCenter mx="md">
        <Text text={`${alkanesCollection.name}`} size="md" color="white" />

        <Row itemsCenter fullY gap="zero">
          <Text text={`${alkanesCollection.count} ${t('items')}`} size="xs" color="textDim" />
        </Row>
      </Column>
    </Column>
  );
}
