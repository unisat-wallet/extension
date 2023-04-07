import React, { CSSProperties, ReactEventHandler } from 'react';

import { ColorTypes, colors } from '@/ui/theme/colors';
import { Gap, spacingGap } from '@/ui/theme/spacing';

import './index.less';

export interface BaseViewProps {
  style?: CSSProperties;
  children?: React.ReactNode;
  justifyCenter?: boolean;
  justifyBetween?: boolean;
  justifyEnd?: boolean;
  itemsCenter?: boolean;
  selfItemsCenter?: boolean;
  gap?: Gap;
  onClick?: ReactEventHandler<HTMLDivElement>;
  px?: Gap;
  py?: Gap;
  pt?: Gap;
  pb?: Gap;
  mt?: Gap;
  mb?: Gap;
  mx?: Gap;
  my?: Gap;
  bg?: ColorTypes;
  rounded?: boolean;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  full?: boolean;
  fullX?: boolean;
  fullY?: boolean;
  color?: ColorTypes;
  relative?: boolean;
  fixed?: boolean;
  classname?: string;
  overflowX?: boolean;
  overflowY?: boolean;
}

export function BaseView(props: BaseViewProps) {
  const {
    children,
    style: $styleBase,
    justifyCenter,
    justifyBetween,
    justifyEnd,
    itemsCenter,
    selfItemsCenter,
    gap,
    px,
    py,
    pt,
    pb,
    mt,
    mb,
    mx,
    my,
    bg,
    rounded,
    roundedTop,
    roundedBottom,
    full,
    fullX,
    fullY,
    color,
    relative,
    onClick,
    fixed,
    classname,
    overflowX,
    overflowY
  } = props;
  const $baseViewStyle = Object.assign(
    {},
    justifyCenter ? { justifyContent: 'center' } : {},
    justifyBetween ? { justifyContent: 'space-between' } : {},
    justifyEnd ? { justifyContent: 'end' } : {},
    itemsCenter ? { alignItems: 'center' } : {},
    selfItemsCenter ? { alignSelf: 'center' } : {},
    gap ? { gap: spacingGap[gap] } : {},
    px ? { paddingLeft: spacingGap[px], paddingRight: spacingGap[px] } : {},
    py ? { paddingTop: spacingGap[py], paddingBottom: spacingGap[py] } : {},
    pt ? { paddingTop: spacingGap[pt] } : {},
    pb ? { paddingBottom: spacingGap[pb] } : {},
    mt ? { marginTop: spacingGap[mt] } : {},
    mb ? { marginBottom: spacingGap[mb] } : {},
    mx ? { marginLeft: spacingGap[mx], marginRight: spacingGap[mx] } : {},
    my ? { marginTop: spacingGap[my], marginBottom: spacingGap[my] } : {},
    bg ? { backgroundColor: colors[bg] } : {},
    rounded ? ({ borderRadius: 5 } as CSSProperties) : {},
    roundedTop ? ({ borderTopLeftRadius: 5, borderTopRightRadius: 5 } as CSSProperties) : {},
    roundedBottom ? ({ borderBottomLeftRadius: 5, borderBottomRightRadius: 5 } as CSSProperties) : {},
    full ? ({ flex: 1, alignSelf: 'stretch' } as CSSProperties) : {},
    fullX ? ({ width: '100%' } as CSSProperties) : {},
    fullY ? ({ height: '100%' } as CSSProperties) : {},
    color ? { color: colors[color] } : {},
    onClick ? { cursor: 'pointer' } : {},
    relative ? { position: 'relative' } : {},
    fixed ? { position: 'fixed' } : {},
    overflowX ? { overflowX: 'auto' } : {},
    overflowY ? { overflowY: 'auto' } : {}
  );
  const $style = Object.assign({}, $styleBase, $baseViewStyle);
  const $classname = [classname].join(' ').trim();

  return (
    <div style={$style} onClick={onClick} className={$classname}>
      {children}
    </div>
  );
}
