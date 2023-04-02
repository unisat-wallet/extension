import { CSSProperties } from 'react';

import { Inscription } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { formatDate } from '../../utils';
import { Card } from '../Card';
import { Column } from '../Column';
import Iframe from '../Iframe';
import { Row } from '../Row';
import { Text } from '../Text';
import './index.less';

function getDateShowdate(date: Date) {
  if (date.getTime() < 100) {
    return 'unconfirmed';
  } else {
    const old = Date.now() - date.getTime();
    if (old < 60 * 1000) {
      return `${Math.floor(old / 1000)} seconds ago`;
    }
    if (old < 1000 * 60 * 60) {
      return `${Math.floor(old / 60000)} minutes age`;
    }
    if (old < 1000 * 60 * 60 * 24) {
      return `${Math.floor(old / 3600000)} hours ago`;
    }
    if (old < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(old / 86400000)} days ago`;
    }
  }
  return formatDate(date, 'yyyy-MM-dd');
}

const $viewPresets = {
  large: {},

  medium: {},

  small: {}
};

const $iframePresets: Record<Presets, CSSProperties> = {
  large: {
    width: 300,
    height: 300
  },
  medium: {
    width: 120,
    height: 120
  },
  small: {
    width: 80,
    height: 80
  }
};

const $timePresets: Record<Presets, string> = {
  large: 'sm',
  medium: 'sm',
  small: 'xxs'
};

const $numberPresets: Record<Presets, string> = {
  large: 'md',
  medium: 'sm',
  small: 'xxs'
};

type Presets = keyof typeof $viewPresets;

const defaultData: any = {
  id: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
  num: 204,
  number: 204,
  detail: {
    id: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
    address: 'tb1p29a2lp3ae7f6zdtxfwldunwzr8q9ff3lm4dcky98c2mphkxnu28sy8lt4x',
    output_value: 546,
    preview: 'https://ordinals.com/preview/675e02e851f6c90fb49aa34edfa07567d8fe3389bde08c3846bdb772c3b832fei0',
    content: 'https://ordinals.com/content/e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
    content_length: 16,
    content_type: 'text/plain',
    timestamp: '2023-02-28 09:25:57 UTC',
    genesis_transaction: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1a',
    location: '1d63091909daf0e82949f40b01a05a41ed8511014f692912d5ff5480210b06b5:0:0',
    output: '1d63091909daf0e82949f40b01a05a41ed8511014f692912d5ff5480210b06b5:0',
    offset: 0,
    content_body: ''
  }
};

export interface InscriptionProps {
  data?: Inscription;
  onClick?: (data: any) => void;
  preset: Presets;
}

export default function InscriptionPreview({ data, onClick, preset }: InscriptionProps) {
  // data = defaultData;
  if (!data?.detail) return <div />;
  if (data.detail) {
    const detail = data.detail;
    const date = new Date(detail.timestamp);
    const time = getDateShowdate(date);
    const isUnconfirmed = date.getTime() < 100;
    const numberStr = isUnconfirmed ? 'unconfirmed' : `# ${data.number}`;

    const isBRC20 = false;

    if (isBRC20) {
      return (
        <Column
          style={{ backgroundColor: '#2a2a2a', width: 117 }}
          onClick={(e) => {
            if (onClick) onClick(data);
          }}>
          <Column style={{ padding: 8, height: 96, backgroundColor: 'black' }}>
            <Row>
              <Text text="PEPE" color="white_muted" />
              <Card preset="style2">
                <Text text="mint" />
              </Card>
            </Row>

            <Text text="420" size="xxl" />
          </Column>

          <Text text="#33467" color="orange" />
          <Text text="bc1pgx3...q5r5ytc" size="xxs" />
          <Text text="2023-03-10" size="xxs" color="textDim" />
        </Column>
      );
    }

    return (
      <Column
        gap="zero"
        onClick={(e) => {
          if (onClick) onClick(data);
        }}
        style={{ backgroundColor: colors.black }}>
        <Iframe preview={detail.preview} style={$iframePresets[preset]} />

        <Column px="md" py="sm" gap="zero" bg="bg2">
          <Text text={numberStr} color="gold" size={$numberPresets[preset] as any} />
          {isUnconfirmed == false && <Text text={time} preset="sub" size={$timePresets[preset] as any} />}
        </Column>
      </Column>
    );
  } else {
    return <div />;
  }
}
