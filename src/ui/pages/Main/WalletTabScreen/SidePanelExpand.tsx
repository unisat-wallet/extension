import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { Icon, Row } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { getUiType, useWallet } from '@/ui/utils';

export function SidePanelExpand() {
  const { t } = useI18n();
  const UIType = getUiType();
  const isInSidePanel = UIType.isSidePanel;
  const wallet = useWallet();
  const [isHovered, setIsHovered] = useState(false);

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
        justifyContent: 'center',
        position: 'relative'
      }}>
      <Tooltip
        title={isInSidePanel ? t('open_as_popup') : t('open_as_side_bar')}
        overlayStyle={{
          minWidth: '70px',
          fontSize: '12px'
        }}
        overlayClassName="side-panel-expand-tooltip"
        placement="bottom">
        <div
          onClick={toggleSidePanel}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ display: 'inline-block', cursor: 'pointer' }}>
          <Icon
            icon={isInSidePanel ? 'side-panel-logo-close' : 'side-panel-logo'}
            size={20}
            containerStyle={{
              opacity: isHovered ? 1 : 0.65,
              color: isHovered ? '#ffffff' : 'inherit'
            }}
          />
        </div>
      </Tooltip>
    </Row>
  );
}
