import React from 'react';

export interface LayoutProps {
  children?: React.ReactNode;
}
export function Layout(props: LayoutProps) {
  const { children } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh'
      }}>
      {children}
    </div>
  );
}
