import { Row } from '@/ui/components';

import { colors } from '@/ui/theme/colors';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { $baseContainerStyle, $baseInputStyle, InputProps } from '.';
export function SearchInput(props: InputProps) {
  const { placeholder, containerStyle, style: $inputStyleOverride, disabled, autoFocus, onSearch, ...rest } = props;
  return (
    <Row
      style={Object.assign(
        {},
        $baseContainerStyle,
        {
          backgroundColor: '#2a2626',
          border: '1px solid #C08F23',
          borderRadius: 8,
          padding: 0,
          alignSelf: 'stretch'
        },
        containerStyle
      )}>
      <Row py={'md'} px={'lg'} full itemsCenter>
        <SearchOutlined style={{ color: '#888' }} />
        <input
          placeholder={placeholder}
          type={'text'}
          disabled={disabled}
          autoFocus={autoFocus}
          style={Object.assign({}, $baseInputStyle, $inputStyleOverride, disabled ? { color: colors.textDim } : {})}
          {...rest}
        />
      </Row>
      <Row
        onClick={onSearch}
        itemsCenter
        justifyCenter
        clickable
        style={{
          cursor: 'pointer',
          height: 42.5,
          width: 42.5,
          borderLeft: '1px solid #C08F23'
        }}>
        <ArrowRightOutlined style={{ color: 'rgba(255,255,255,.85)' }} />
      </Row>
    </Row>
  );
}
