import { EventEmitter } from 'events';

import browser, { browserTabsCreate, browserTabsOnRemoved, browserTabsOnUpdated } from './browser';

const tabEvent = new EventEmitter();

browserTabsOnUpdated((tabId, changeInfo) => {
    if (changeInfo.url) {
        tabEvent.emit('tabUrlChanged', tabId, changeInfo.url);
    }
});

// window close will trigger this event also
browserTabsOnRemoved((tabId) => {
    tabEvent.emit('tabRemove', tabId);
});

const createTab = async (url: string): Promise<number | undefined> => {
    const tab = await browserTabsCreate({
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
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        
        if (!tabs || tabs.length === 0) {
            return {};
        }

        const [activeTab] = tabs;
        const { id, title, url } = activeTab;
        const { origin, protocol } = url ? new URL(url) : { origin: null, protocol: null };

        if (!origin || origin === 'null') {
            return {};
        }

        return { id, title, origin, protocol, url };
    } catch (error) {
        console.error("Failed to query active tab:", error);
        return {};
    }
};

export default tabEvent;

export { createTab, openIndexPage, queryCurrentActiveTab };
