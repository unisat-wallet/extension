import { browserStorageLocalGet, browserStorageLocalSet } from './browser';

let cacheMap;

const get = async (prop?) => {
    if (cacheMap) {
        return cacheMap.get(prop);
    }

    const result = await browserStorageLocalGet(null);
    cacheMap = new Map(Object.entries(result).map(([k, v]) => [k, v]));

    return prop ? result[prop] : result;
};

const set = async (prop, value): Promise<void> => {
    await browserStorageLocalSet({ [prop]: value });
    cacheMap.set(prop, value);
};

export default {
    get,
    set
};
