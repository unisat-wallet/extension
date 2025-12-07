import { preferenceService } from '@unisat/wallet-background';

// Chrome SidePanel API type declarations
declare global {
  interface Chrome {
    sidePanel?: {
      setPanelBehavior: (options: { openPanelOnActionClick: boolean }) => Promise<void>;
    };
  }
}

/**
 * Configure the side panel behavior based on user preference
 */
export async function initSidePanel() {
  // Use type assertion to access the sidePanel API
  const chromeWithSidePanel = chrome as any;

  if (!chromeWithSidePanel.sidePanel) {
    return; // Skip if sidePanel API is not available
  }

  const openInSidePanel = preferenceService.getOpenInSidePanel();

  if (openInSidePanel) {
    // If user previously used side panel, associate action click with side panel opening
    try {
      await chromeWithSidePanel.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      console.error('[Background] Failed to set side panel behavior:', error);
    }
  } else {
    // User prefers popup mode - don't associate action with side panel
    try {
      await chromeWithSidePanel.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    } catch (error) {
      console.error('[Background] Failed to set side panel behavior:', error);
    }
  }
}
