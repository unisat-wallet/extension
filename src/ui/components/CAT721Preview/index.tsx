import { CAT_VERSION } from '@/shared/types';
import { useCAT721NFTContentBaseUrl } from '@/ui/state/settings/hooks';

import { Column } from '../Column';
import Iframe from '../Iframe';
import { Image } from '../Image';
import { Row } from '../Row';
import { Sizes, Text } from '../Text';

// import './index.less';

const $viewPresets = {
  large: {},

  medium: {},

  small: {}
};

const $stylePresets: {
  [key: string]: {
    width: number;
    height: number;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    textSize: Sizes;
  };
} = {
  large: {
    width: 300,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    textSize: 'md'
  },
  medium: {
    width: 156,
    height: 156,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    textSize: 'sm'
  },
  small: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    textSize: 'xxs'
  }
};

type Presets = keyof typeof $viewPresets;

export interface CAT721PreviewProps {
  version: CAT_VERSION;
  collectionId: string;
  contentType: string;
  localId: string;
  onClick?: (data: any) => void;
  preset: Presets;
}

export default function CAT721Preview({
  version,
  collectionId,
  contentType,
  localId,
  onClick,
  preset
}: CAT721PreviewProps) {
  const style = $stylePresets[preset];

  const contentBaseUrl = useCAT721NFTContentBaseUrl(version);
  return (
    <Column gap="zero" onClick={onClick} style={{}}>
      {contentType && contentType.includes('html') ? (
        <Iframe
          preview={`${contentBaseUrl}/api/collections/${collectionId}/localId/${localId}/content`}
          style={$stylePresets[preset]}
        />
      ) : (
        <Image
          src={`${contentBaseUrl}/api/collections/${collectionId}/localId/${localId}/content`}
          width={style.width}
          height={style.height}
          style={{
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius
          }}
        />
      )}

      <Row
        px="lg"
        py="sm"
        gap="zero"
        bg="bg4"
        style={{
          borderBottomLeftRadius: style.borderTopLeftRadius,
          borderBottomRightRadius: style.borderTopRightRadius
        }}>
        <Row my="sm">
          <Text text={'Local Id:'} color="textDim" size={style.textSize} />

          <Text text={localId} color="white" size={style.textSize} />
        </Row>
      </Row>
    </Column>
  );
}
