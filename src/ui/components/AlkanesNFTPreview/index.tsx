import { AlkanesInfo } from '@/shared/types';
import { shortDesc } from '@/ui/utils';

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
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    textSize: Sizes;
    shortLength?: number;
  };
} = {
  large: {
    width: 300,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    textSize: 'md',
    shortLength: 20
  },
  medium: {
    width: 156,
    height: 156,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    textSize: 'sm',
    shortLength: 20
  },
  small: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    textSize: 'xxs',
    shortLength: 8
  }
};

type Presets = keyof typeof $viewPresets;

export interface InscriptionProps {
  alkanesInfo: AlkanesInfo;
  onClick?: (data: any) => void;
  preset: Presets;
}

export default function AlkanesNFTPreview({ alkanesInfo, onClick, preset }: InscriptionProps) {
  const style = $stylePresets[preset];

  // Use image from nftData if available, otherwise fallback to logo
  const imageUrl = alkanesInfo.nftData?.image || alkanesInfo.logo || '';

  return (
    <Column gap="zero" onClick={onClick} style={{}}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          width={style.width}
          height={style.height}
          style={{
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius
          }}
        />
      ) : (
        <Row style={{ width: style.width, height: style.height }} itemsCenter justifyCenter>
          <Text text={alkanesInfo.name} size="xs" color="textDim" />
        </Row>
      )}

      <Column
        px="lg"
        py="sm"
        gap="zero"
        bg="bg4"
        style={{
          width: style.width,
          borderBottomLeftRadius: style.borderTopLeftRadius,
          borderBottomRightRadius: style.borderTopRightRadius
        }}>
        <Row my="xs">
          <Text text={shortDesc(alkanesInfo.name, style.shortLength)} color="white" size={style.textSize} />
        </Row>
        <Row my="xs">
          <Text text={alkanesInfo.alkaneid} color="textDim" size={style.textSize} />
        </Row>
      </Column>
    </Column>
  );
}
