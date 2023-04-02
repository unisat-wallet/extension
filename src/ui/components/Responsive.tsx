import { useExtensionIsInTab } from '../features/browser/tabs';

export const AppDimensions = (props) => {
  const extensionIsInTab = useExtensionIsInTab();

  return (
    <div
      style={{
        width: extensionIsInTab ? '100vw' : '357px',
        height: extensionIsInTab ? '100vh' : '600px'
      }}
      {...props}
    />
  );
};
