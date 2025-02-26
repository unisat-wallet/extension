import { isNumber } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';

import phishingService from '@/background/service/phishing';
import browser, {
  browserTabsCreate,
  browserTabsGetCurrent,
  browserTabsQuery,
  browserTabsUpdate
} from '@/background/webapi/browser';

export const openExtensionInTab = async (route: string, params: any = {}) => {
  // If it's an internal extension page, open directly
  if (route.startsWith('index.html')) {
    const tab = await browserTabsCreate({
      url: browser.runtime.getURL(route),
      active: true
    });
    return tab;
  }

  try {
    // Check if target URL is a phishing site
    const hostname = new URL(route).hostname;
    if (phishingService.checkPhishing(hostname)) {
      // If it's a phishing site, open warning page
      await browserTabsCreate({
        url: browser.runtime.getURL(`index.html#/phishing?hostname=${encodeURIComponent(hostname)}`),
        active: true
      });
      return;
    }

    // Open page normally
    const tab = await browserTabsCreate({ url: route });
    return tab;
  } catch (e) {
    console.error('Failed to check URL:', e);
    // If URL parsing fails, still open the target page
    const tab = await browserTabsCreate({ url: route });
    return tab;
  }
};

export const extensionIsInTab = async () => {
  return Boolean(await browserTabsGetCurrent());
};

export const focusExtensionTab = async () => {
  const tab = await browserTabsGetCurrent();
  if (tab && isNumber(tab?.id) && tab?.id !== browser.tabs.TAB_ID_NONE) {
    browserTabsUpdate(tab.id, { active: true });
  }
};

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false);
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab();
      setIsInTab(inTab);
    };
    init();
  }, []);
  return isInTab;
};

export const useOpenExtensionInTab = () => {
  return useCallback(async () => {
    await openExtensionInTab('index.html', {});
    window.close();
  }, []);
};

export const getCurrentTab = async () => {
  const tabs = await browserTabsQuery({ active: true, currentWindow: true });
  return tabs[0];
};
