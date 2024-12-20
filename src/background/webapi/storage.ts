import { browserStorageLocalGet, browserStorageLocalSet } from './browser';

let cacheMap: Map<string, unknown> | null = null;

const initializeCacheMap = async () => {
    if (!cacheMap) {
        const storageData = await browserStorageLocalGet(null);
        cacheMap = new Map(Object.entries(storageData));
    }
};

const get = async <T>(prop: string): Promise<T | undefined> => {
    await initializeCacheMap();
    return cacheMap?.get(prop) as T | undefined;
};

const set = async <T>(prop: string, value: T): Promise<void> => {
    await initializeCacheMap();
    cacheMap?.set(prop, value);
    await browserStorageLocalSet({ [prop]: value });
};

const clearCache = () => {
    cacheMap = null;
};

export default {
    get,
    set,
    clearCache
};
