import { colors } from '@/ui/theme/colors';
import { $baseContainerStyle, $baseInputStyle, InputProps } from '.';

export function TextInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, maxLength, ...rest } = props;
  return (
    <div style={Object.assign({}, $baseContainerStyle, containerStyle)}>
      <input
        placeholder={placeholder}
        type={'text'}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        style={Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {})}
        {...rest}
      />
    </div>
  );
}
