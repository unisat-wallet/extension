import browser, { Runtime, Tabs, Windows } from 'webextension-polyfill';

export interface WindowProps extends Windows.CreateCreateDataType{
    route?: string;
}

export async function browserWindowsGetCurrent(params?: Windows.GetInfo) {
    return await browser.windows.getCurrent(params);
}

export async function browserWindowsCreate(params?: Windows.CreateCreateDataType) {
    return await browser.windows.create(params);
}

export async function browserWindowsUpdate(windowId: number, updateInfo: Windows.UpdateUpdateInfoType) {
    return await browser.windows.update(windowId, updateInfo);
}

export async function browserWindowsRemove(windowId: number) {
    return await browser.windows.remove(windowId);
}

export async function browserStorageLocalGet(val?: string | string[] | Record<string, unknown> | null) {
    return await browser.storage.local.get(val);
}

export async function browserStorageLocalSet(val: Record<string, unknown>) {
    return await browser.storage.local.set(val);
}

export async function browserTabsGetCurrent() {
    return await browser.tabs.getCurrent();
}

export async function browserTabsQuery(params: Tabs.QueryQueryInfoType) {
    return await browser.tabs.query(params);
}

export async function browserTabsCreate(params: Tabs.CreateCreatePropertiesType) {
    return await browser.tabs.create(params);
}

export async function browserTabsUpdate(tabId: number, params: Tabs.UpdateUpdatePropertiesType) {
    return await browser.tabs.update(tabId, params);
}

export function browserWindowsOnFocusChanged(listener: (windowId: number) => void) {
    browser.windows.onFocusChanged.addListener(listener);
}

export function browserWindowsOnRemoved(listener: (windowId: number) => void) {
    browser.windows.onRemoved.addListener(listener);
}

export function browserTabsOnUpdated(listener: (tabId: number, changeInfo: Tabs.OnUpdatedChangeInfoType) => void) {
    browser.tabs.onUpdated.addListener(listener);
}

export function browserTabsOnRemoved(listener: (tabId: number) => void) {
    browser.tabs.onRemoved.addListener(listener);
}

export function browserRuntimeOnConnect(listener: (port: Runtime.Port) => void) {
    browser.runtime.onConnect.addListener(listener);
}

export function browserRuntimeOnInstalled(listener: (details: Runtime.OnInstalledDetailsType) => void) {
    browser.runtime.onInstalled.addListener(listener);
}

export function browserRuntimeConnect(
    extensionId?: string,
    connectInfo?: Runtime.ConnectConnectInfoType
): Runtime.Port {
    return browser.runtime.connect(extensionId, connectInfo);
}

export default browser;
