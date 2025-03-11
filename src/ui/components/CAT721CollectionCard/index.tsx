import { useCallback } from 'react';

import { CAT721Balance } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCAT721NFTContentBaseUrl } from '@/ui/state/settings/hooks';

import { Column } from '../Column';
import Iframe from '../Iframe';
import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

export interface CAT721CollectionCardProps {
  cat721Balance: CAT721Balance;
  contentType: string;
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

export function CAT721CollectionCard(props: CAT721CollectionCardProps) {
  const { cat721Balance, contentType, onClick } = props;
  const { t } = useI18n();

  const previewLocalIds = cat721Balance.previewLocalIds.slice(0, 4);
  if (previewLocalIds.length > 1) {
    for (let i = 0; i < 4; i++) {
      if (!previewLocalIds[i]) {
        previewLocalIds[i] = 'PLACEHOLDER';
      }
    }
  }

  const contentBaseUrl = useCAT721NFTContentBaseUrl();

  const isHTML = contentType == 'text/html';

  const renderItem = useCallback(
    (key: string, localId: string, size: number) => {
      return isHTML ? (
        <Iframe
          key={key}
          preview={`${contentBaseUrl}/api/collections/${cat721Balance.collectionId}/localId/${localId}/content`}
          style={{
            width: size,
            height: size,
            margin: 4
          }}
        />
      ) : (
        <Image
          key={key}
          src={`${contentBaseUrl}/api/collections/${cat721Balance.collectionId}/localId/${localId}/content`}
          width={size}
          height={size}
          style={{
            borderRadius: 8,
            margin: 4
          }}
        />
      );
    },
    [contentBaseUrl, cat721Balance.collectionId, isHTML]
  );

  return (
    <Column>
      {cat721Balance.previewLocalIds.length > 1 ? (
        <CardComponent onClick={onClick}>
          {previewLocalIds.map((localId, index) => {
            if (localId === 'PLACEHOLDER') {
              return (
                <Row
                  key={cat721Balance.collectionId + index}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 8,
                    margin: 4,
                    backgroundColor: '#201F1F'
                  }}
                />
              );
            } else {
              return renderItem(cat721Balance.collectionId + index, localId, 68);
            }
          })}
        </CardComponent>
      ) : (
        <CardComponent onClick={onClick}>
          {renderItem(cat721Balance.collectionId, previewLocalIds[0], 142)}
        </CardComponent>
      )}

      <Column justifyBetween justifyCenter mx="md">
        <Text text={`${cat721Balance.name}`} size="md" color="white" />

        <Row itemsCenter fullY gap="zero">
          <Text text={`${cat721Balance.count} ${t('items')}`} size="xs" color="textDim" />
        </Row>
      </Column>
    </Column>
  );
}
