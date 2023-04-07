import { CSSProperties, useEffect } from 'react';

import { colors } from '@/ui/theme/colors';

import { Text } from '../../Text';
import './index.less';

export type ToastPresets = keyof typeof $viewPresets;
export interface ToastProps {
  preset: ToastPresets;
  content: string;
  onClose: () => void;
}

const $baseViewStyle = {
  alignSelf: 'end',
  padding: 4,
  borderRadius: 4,
  paddingLeft: 8,
  paddingRight: 8,
  marginLeft: 16,
  marginRight: 16
} as CSSProperties;

const $viewPresets = {
  info: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.black_dark
  }) as CSSProperties,

  success: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.green
  }) as CSSProperties,

  error: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.danger
  }) as CSSProperties,

  warning: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.warning
  }) as CSSProperties
};

export function Toast(props: ToastProps) {
  const { preset, content, onClose } = props;
  useEffect(() => {
    setTimeout(() => {
      onClose();
    }, 2000);
  }, []);

  return (
    <div className="action-container">
      <div className="toast" style={$viewPresets[preset]}>
        <Text text={content} preset="regular" color="white" textCenter />
      </div>
    </div>
  );
}
