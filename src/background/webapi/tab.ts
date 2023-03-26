import { EventEmitter } from 'events';

import browser from './browser';

const tabEvent = new EventEmitter();

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    tabEvent.emit('tabUrlChanged', tabId, changeInfo.url);
  }
});

// window close will trigger this event also
browser.tabs.onRemoved.addListener((tabId) => {
  tabEvent.emit('tabRemove', tabId);
});

const createTab = async (url): Promise<number | undefined> => {
  const tab = await browser.tabs.create({
    active: true,
    url
  });

  return tab?.id;
};

const openIndexPage = (route = ''): Promise<number | undefined> => {
  const url = `index.html${route && `#${route}`}`;

  return createTab(url);
};

const queryCurrentActiveTab = async function () {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs) return resolve({});
      const [activeTab] = tabs;
      const { id, title, url } = activeTab;
      const { origin, protocol } = url ? new URL(url) : { origin: null, protocol: null };

      if (!origin || origin === 'null') {
        resolve({});
        return;
      }

      resolve({ id, title, origin, protocol, url });
    });
  });
};

export default tabEvent;

export { createTab, openIndexPage, queryCurrentActiveTab };
