import React, { CSSProperties, useEffect } from 'react';

import { routes } from '@/ui/pages/MainRoute';
import { useBooted, useIsUnlocked } from '@/ui/state/global/hooks';

import './index.less';

export interface LayoutProps {
  children?: React.ReactNode;
  style?: CSSProperties;
}
export function Layout(props: LayoutProps) {
  const isBooted = useBooted();
  const isUnlocked = useIsUnlocked();

  useEffect(() => {
    if (isBooted && !isUnlocked && location.href.includes(routes.UnlockScreen.path) === false) {
      const basePath = location.href.split('#')[0];
      location.href = `${basePath}#${routes.UnlockScreen.path}`;
      return;
    }
  }, [isBooted, isUnlocked]);

  const { children, style: $styleBase } = props;
  return (
    <div
      className="layout"
      style={Object.assign(
        {
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        },
        $styleBase
      )}>
      {children}
    </div>
  );
}
