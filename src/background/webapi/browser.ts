import { MANIFEST_VERSION } from '@/shared/constant';

export interface WindowProps {
    focused?: boolean;
    url?: string;
    type?: 'normal' | 'popup' | 'panel' | 'app' | 'devtools';
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'docked';
    route?: string;
}

function getBrowser() {
    if (typeof globalThis.browser === 'undefined') {
        return chrome;
    } else {
        return globalThis.browser;
    }
}

const browser = getBrowser();

export async function browserWindowsGetCurrent(params?: {windowTypes?: string[]}) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.windows.getCurrent(params, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.windows.getCurrent(params);
    }
}

export async function browserWindowsCreate(params?: WindowProps) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.windows.create(params, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.windows.create(params);
    }
}

export async function browserWindowsUpdate(windowId: number, updateInfo: WindowProps) {
    if (MANIFEST_VERSION == 'mv2') {
        return new Promise((resolve, reject) => {
            browser.windows.update(windowId, updateInfo, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.windows.update(windowId, updateInfo);
    }
}

export async function browserWindowsRemove(windowId: number) {
    if (MANIFEST_VERSION == 'mv2') {
        return new Promise((resolve, reject) => {
            browser.windows.remove(windowId, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.windows.remove(windowId);
    }
}

export async function browserStorageLocalGet(val?: string | string[] | Record<string, unknown> | null) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.storage.local.get(val, (res) => {
                resolve(res);
            });
        });
    } else {
        return await browser.storage.local.get(val);
    }
}

export async function browserStorageLocalSet(val: Record<string, string | number | boolean | null | unknown[] | Record<string, unknown>>) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.storage.local.set(val, (res) => {
                resolve(res);
            });
        });
    } else {
        return await browser.storage.local.set(val);
    }
}

export async function browserTabsGetCurrent() {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.tabs.getCurrent((val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.tabs.getCurrent();
    }
}

export async function browserTabsQuery(params: {active?: boolean; currentWindow?: boolean;}) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.tabs.query(params, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.tabs.query(params);
    }
}

export async function browserTabsCreate(params: {active: boolean; url: string;}) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.tabs.create(params, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.tabs.create(params);
    }
}

export async function browserTabsUpdate(tabId: number, params: {active: boolean;}) {
    if (MANIFEST_VERSION === 'mv2') {
        return new Promise((resolve, reject) => {
            browser.tabs.update(tabId, params, (val) => {
                resolve(val);
            });
        });
    } else {
        return await browser.tabs.update(tabId, params);
    }
}

export function browserWindowsOnFocusChanged(listener) {
    browser.windows.onFocusChanged.addListener(listener);
}

export function browserWindowsOnRemoved(listener) {
    browser.windows.onRemoved.addListener(listener);
}

export function browserTabsOnUpdated(listener) {
    browser.tabs.onUpdated.addListener(listener);
}

export function browserTabsOnRemoved(listener) {
    browser.tabs.onRemoved.addListener(listener);
}

export function browserRuntimeOnConnect(listener) {
    browser.runtime.onConnect.addListener(listener);
}

export function browserRuntimeOnInstalled(listener: (details: chrome.runtime.InstalledDetails) => void) {
    browser.runtime.onInstalled.addListener(listener);
}

export function browserRuntimeConnect(
    extensionId?: string,
    connectInfo?: chrome.runtime.ConnectInfo
): chrome.runtime.Port {
    return browser.runtime.connect(extensionId, connectInfo);
}

export default browser;
