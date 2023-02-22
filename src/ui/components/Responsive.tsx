import { useExtensionIsInTab } from '../features/browser/tabs';

export const AppDimensions = (props) => {
  const extensionIsInTab = useExtensionIsInTab();

  return (
    <div
      style={{
        width: extensionIsInTab ? '100vw' : '31.25rem',
        height: extensionIsInTab ? '100vh' : '50rem'
      }}
      {...props}
    />
  );
};
