import { DeviceContext, DeviceContextType } from '@unisat/wallet-state';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    hasBottomButton: false,
    cardColumnsInList: 2
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

  const [screenInnerWidth, setScreenInnerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreenSize = window.innerWidth <= 768;
      selfRef.current.isMobileScreenSize = isMobileScreenSize;
      selfRef.current.isDesktopScreenSize = !isMobileScreenSize;
      setIsMobileScreenSize(isMobileScreenSize);
      setIsDesktopScreenSize(!isMobileScreenSize);
      setScreenInnerWidth(window.innerWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [setScreenInnerWidth]);

  const cardColumnsInList = useMemo(() => {
    return Math.max(Math.ceil(screenInnerWidth / 180), 2);
  }, [screenInnerWidth]);

  const self = selfRef.current;

  return (
    <DeviceContext.Provider
      value={{
        ...self,
        isMobileScreenSize,
        isDesktopScreenSize,
        cardColumnsInList
      }}>
      {children}
    </DeviceContext.Provider>
  );
}
