import React from 'react';

import './index.less';

export interface LayoutProps {
  children?: React.ReactNode;
}
export function Layout(props: LayoutProps) {
  const { children } = props;
  return (
    <div
      className="layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
      {children}
    </div>
  );
}
