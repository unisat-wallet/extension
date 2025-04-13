import { Tooltip } from 'antd';
import { CSSProperties, useEffect, useRef, useState } from 'react';

import { Inscription } from '@/shared/types';
import { useOrdinalsWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { LoadingOutlined } from '@ant-design/icons';

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
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  medium: {
    backgroundColor: colors.black,
    width: '100%',
    maxWidth: '180px',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  small: {
    backgroundColor: colors.black,
    width: '100%',
    maxWidth: '120px',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }
};

const $iframePresets: Record<Presets, CSSProperties> = {
  large: {
    width: '100%',
    aspectRatio: '1/1',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none'
  },
  medium: {
    width: '100%',
    maxWidth: '180px',
    aspectRatio: '1/1',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none'
  },
  small: {
    width: '100%',
    maxWidth: '120px',
    aspectRatio: '1/1',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none'
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
  asLogo?: boolean;
  hideValue?: boolean;
  style?: CSSProperties;
}

export default function InscriptionPreview({ data, onClick, preset, asLogo, hideValue }: InscriptionProps) {
  const [isVisible, setIsVisible] = useState(false);
  /** iframe loaded */
  const [isLoaded, setIsLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const date = new Date(data.timestamp * 1000);
  const time = getDateShowdate(date);
  const isUnconfirmed = date.getTime() < 100;
  let numberStr = '';
  if (isUnconfirmed) {
    numberStr = 'unconfirmed';
  } else if (data.inscriptionNumber) {
    numberStr = `# ${data.inscriptionNumber}`;
  }

  const url = useOrdinalsWebsite();
  let preview = data.preview;
  if (!preview) {
    preview = url + '/preview/' + data.inscriptionId;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // 100px ahead
    );

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleIframeLoaded = () => {
    setIsLoaded(true);
  };

  if (asLogo) {
    return <Iframe preview={preview} style={$iframePresets[preset]} onLoad={handleIframeLoaded} />;
  }

  const valueText = `${data.outputValue} sats`;

  return (
    <div ref={previewRef} style={{ pointerEvents: 'auto', width: '100%', cursor: onClick ? 'pointer' : 'default' }}>
      <Column
        gap="zero"
        onClick={onClick}
        style={Object.assign({ position: 'relative', width: '100%' }, $containerPresets[preset])}>
        {isVisible ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', fontSize: 0, lineHeight: 0 }}>
            <Iframe preview={preview} style={$iframePresets[preset]} onLoad={handleIframeLoaded} />
            {!isLoaded && (
              <div
                style={{
                  ...$iframePresets[preset],
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: colors.bg4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <LoadingOutlined />
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              ...$iframePresets[preset],
              backgroundColor: colors.bg4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 0,
              lineHeight: 0
            }}></div>
        )}

        {data.outputValue && !hideValue ? (
          <div style={Object.assign({ position: 'absolute', width: '100%', top: 0, left: 0 }, $iframePresets[preset])}>
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
                      text={valueText}
                      size="xs"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
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
        ) : null}

        {numberStr && (
          <Column
            px="md"
            py="sm"
            gap="zero"
            bg="bg4"
            full
            style={{
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 8,
              width: '100%',
              marginTop: -1,
              fontSize: 0
            }}>
            <Text text={numberStr} color="gold" size={$numberPresets[preset] as any} max1Lines />
            {isUnconfirmed == false && data.timestamp && (
              <Text text={time} preset="sub" size={$timePresets[preset] as any} />
            )}
          </Column>
        )}
      </Column>
    </div>
  );
}
