import { isNull } from 'lodash';
import { useState } from 'react';

import { Icon } from '@/ui/components';
import { spacing } from '@/ui/theme/spacing';
import { useI18n } from '@unisat/wallet-state';
import { $baseContainerStyle, $baseInputStyle, InputProps } from '.';

export function PasswordInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, ...rest } = props;
  const { t } = useI18n();
  const [type, setType] = useState<'password' | 'text'>('password');
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input
        placeholder={isNull(placeholder) ? t('password') : placeholder}
        type={type}
        style={Object.assign({}, $baseInputStyle, $inputStyleOverride)}
        {...rest}
      />
      {type === 'password' && (
        <Icon icon="eye-slash" style={{ marginLeft: spacing.tiny }} onClick={() => setType('text')} color="textDim" />
      )}
      {type === 'text' && <Icon icon="eye" style={{ marginLeft: spacing.tiny }} onClick={() => setType('password')} />}
    </div>
  );
}
