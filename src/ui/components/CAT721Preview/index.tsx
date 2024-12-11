import { useCAT721NFTContentBaseUrl } from '@/ui/state/settings/hooks';

import { Column } from '../Column';
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
    borderRadius: number;
    textSize: Sizes;
  };
} = {
  large: {
    width: 300,
    height: 300,
    borderRadius: 20,
    textSize: 'md'
  },
  medium: {
    width: 156,
    height: 156,
    borderRadius: 15,
    textSize: 'sm'
  },
  small: {
    width: 80,
    height: 80,
    borderRadius: 10,
    textSize: 'xxs'
  }
};

type Presets = keyof typeof $viewPresets;

export interface InscriptionProps {
  collectionId: string;
  localId: string;
  onClick?: (data: any) => void;
  preset: Presets;
}

export default function CAT721Preview({ collectionId, localId, onClick, preset }: InscriptionProps) {
  const style = $stylePresets[preset];

  const contentBaseUrl = useCAT721NFTContentBaseUrl();
  return (
    <Column gap="zero" onClick={onClick} style={{}}>
      <Image
        src={`${contentBaseUrl}/api/collections/${collectionId}/localId/${localId}/content`}
        width={style.width}
        height={style.height}
        style={{
          borderTopLeftRadius: style.borderRadius,
          borderTopRightRadius: style.borderRadius
        }}
      />
      <Row
        px="lg"
        py="sm"
        gap="zero"
        bg="bg4"
        style={{
          borderBottomLeftRadius: style.borderRadius,
          borderBottomRightRadius: style.borderRadius
        }}>
        <Row my="sm">
          <Text text={'Local Id:'} color="textDim" size={style.textSize} />

          <Text text={localId} color="white" size={style.textSize} />
        </Row>
      </Row>
    </Column>
  );
}
