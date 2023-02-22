import pageStateCache from '../service/pageStateCache';

export { default as createPersistStore } from './persisitStore';
export { default as PromiseFlow } from './promiseFlow';

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

export const wait = (fn: () => void, ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};

export const setPageStateCacheWhenPopupClose = (data) => {
  const cache = pageStateCache.get();
  if (cache && cache.path === '/import/wallet-connect') {
    pageStateCache.set({
      ...cache,
      states: {
        ...cache.states,
        data
      }
    });
  }
};

export const hasWalletConnectPageStateCache = () => {
  const cache = pageStateCache.get();
  if (cache && cache.path === '/import/wallet-connect') {
    return true;
  }
  return false;
};
