import { useExtensionIsInTab } from '../features/browser/tabs';
import { ReactNode } from 'react';

export const AppDimensions = (props: { children: ReactNode }) => {
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
