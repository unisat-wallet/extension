import { useEffect } from 'react';

import { Icon, Row } from '@/ui/components';
import { getUiType, useWallet } from '@/ui/utils';

export function SidePanelExpand() {
  const UIType = getUiType();
  const isInSidePanel = UIType.isSidePanel;
  const wallet = useWallet();

  useEffect(() => {
    if (isInSidePanel) {
      wallet.setOpenInSidePanel(true);
    }
  }, [isInSidePanel, wallet]);

  const toggleSidePanel = async () => {
    try {
      const windowId = (await chrome.windows.getCurrent()).id;

      if (isInSidePanel) {
        await wallet.setOpenInSidePanel(false);
        window.close();
      } else {
        await wallet.setOpenInSidePanel(true);
        await (chrome as any).sidePanel.open({ windowId });
      }
    } catch (error) {
      console.error('SidePanelExpand error:', error);
    }
  };

  return (
    <Row
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={toggleSidePanel}>
      <Icon icon={isInSidePanel ? 'side-panel-logo-close' : 'side-panel-logo'} size={18} />
    </Row>
  );
}
