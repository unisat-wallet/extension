import { DeviceContext, DeviceContextType } from '@unisat/wallet-state';
import { useEffect, useRef, useState } from 'react';
import { getUiType } from '../utils';

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const selfRef = useRef<DeviceContextType>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isExtension: true,
    isExtensionInExpandView: false,
    isExtensionInSideBar: false,
    isMobileScreenSize: false,
    isDesktopScreenSize: false,
    platform: 'extension',
    hasBottomButton: false
  });

  const [isMobileScreenSize, setIsMobileScreenSize] = useState(false);
  const [isDesktopScreenSize, setIsDesktopScreenSize] = useState(false);

  useEffect(() => {
    const isSidePanel = getUiType().isSidePanel;
    selfRef.current.isExtensionInSideBar = isSidePanel;

    const isExpandView = (() => {
      if (typeof window === 'undefined') {
        return false;
      }
      if (window.innerWidth > 156 * 3) {
        return true;
      } else {
        return false;
      }
    })();
    selfRef.current.isExtensionInExpandView = isExpandView;
  });

  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreenSize = window.innerWidth <= 768;
      selfRef.current.isMobileScreenSize = isMobileScreenSize;
      selfRef.current.isDesktopScreenSize = !isMobileScreenSize;
      setIsMobileScreenSize(isMobileScreenSize);
      setIsDesktopScreenSize(!isMobileScreenSize);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const self = selfRef.current;

  return (
    <DeviceContext.Provider
      value={{
        ...self,
        isMobileScreenSize,
        isDesktopScreenSize
      }}>
      {children}
    </DeviceContext.Provider>
  );
}
