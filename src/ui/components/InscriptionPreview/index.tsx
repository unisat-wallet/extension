import { Tooltip } from 'antd';
import { CSSProperties } from 'react';

import { Inscription } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

import { formatDate } from '../../utils';
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
      return `${Math.floor(old / 1000)} secs ago`;
    }
    if (old < 1000 * 60 * 60) {
      return `${Math.floor(old / 60000)} mins ago`;
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

const $containerPresets: Record<Presets, CSSProperties> = {
  large: {
    backgroundColor: colors.black,
    width: 300
  },
  medium: {
    backgroundColor: colors.black,
    width: 144,
    height: 180
  },
  small: {
    backgroundColor: colors.black,
    width: 80
  }
};

const $iframePresets: Record<Presets, CSSProperties> = {
  large: {
    width: 300,
    height: 300
  },
  medium: {
    width: 144,
    height: 144
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

export interface InscriptionProps {
  data: Inscription;
  onClick?: (data: any) => void;
  preset: Presets;
}

export default function InscriptionPreview({ data, onClick, preset }: InscriptionProps) {
  const date = new Date(data.timestamp * 1000);
  const time = getDateShowdate(date);
  const isUnconfirmed = date.getTime() < 100;
  const numberStr = isUnconfirmed ? 'unconfirmed' : `# ${data.inscriptionNumber}`;

  return (
    <Column gap="zero" onClick={onClick} style={Object.assign({ position: 'relative' }, $containerPresets[preset])}>
      <Iframe preview={data.preview} style={$iframePresets[preset]} />
      <div style={Object.assign({ position: 'absolute', zIndex: 10 }, $iframePresets[preset])}>
        <Column fullY>
          <Row style={{ flex: 1 }} />
          <Row fullX justifyEnd mb="sm">
            <Tooltip
              title={`The UTXO containing this inscription has ${data.outputValue} sats`}
              overlayStyle={{
                fontSize: fontSizes.xs
              }}>
              <div>
                <Text
                  text={`${data.outputValue} sats`}
                  size="xs"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: 2,
                    borderRadius: 5,
                    paddingLeft: 4,
                    paddingRight: 4,
                    marginRight: 2
                  }}
                />
              </div>
            </Tooltip>
          </Row>
        </Column>
      </div>
      <Column px="md" py="sm" gap="zero" bg="bg4" full>
        <Text text={numberStr} color="gold" size={$numberPresets[preset] as any} />
        {isUnconfirmed == false && <Text text={time} preset="sub" size={$timePresets[preset] as any} />}
      </Column>
    </Column>
  );
}
