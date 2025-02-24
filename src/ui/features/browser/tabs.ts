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
  // 如果是扩展内部页面，直接打开
  if (route.startsWith('index.html')) {
    const tab = await browserTabsCreate({
      url: browser.runtime.getURL(route),
      active: true
    });
    return tab;
  }

  try {
    // 检查目标 URL 是否是钓鱼网站
    const hostname = new URL(route).hostname;
    if (phishingService.checkPhishing(hostname)) {
      // 如果是钓鱼网站，打开警告页面
      await browserTabsCreate({
        url: browser.runtime.getURL(`index.html#/phishing?hostname=${encodeURIComponent(hostname)}`),
        active: true
      });
      return;
    }

    // 正常打开页面
    const tab = await browserTabsCreate({ url: route });
    return tab;
  } catch (e) {
    console.error('Failed to check URL:', e);
    // 如果 URL 解析失败，仍然打开目标页面
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
