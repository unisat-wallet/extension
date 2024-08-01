import { CSSProperties } from 'react';

import { spacingGap } from '@/ui/theme/spacing';

import { BaseView, BaseViewProps } from '../BaseView';
import './index.less';

export type RowProps = BaseViewProps;

const $rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: spacingGap.md
} as CSSProperties;

export function Row(props: RowProps) {
    const { style: $styleOverride, itemsCenter, fullX, justifyCenter, ...rest } = props;

    const $style: CSSProperties = {
        ...$rowStyle,
        ...(itemsCenter && { alignItems: 'center' }),
        ...(fullX && { width: '100%' }),
        ...(justifyCenter && { justifyContent: 'center' }),
        ...$styleOverride
    };

    return <BaseView style={$style} {...rest} classname="row-container" />;
}
