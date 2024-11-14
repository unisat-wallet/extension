export { default as createPersistStore } from './persisitStore';
export { default as PromiseFlow } from './promiseFlow';

export const underline2Camelcase = (str: string) => {
    return str.replace(/_(.)/g, (m: string, p1: string) => p1.toUpperCase());
};

export const wait = (fn: () => void, ms = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            fn();
            resolve(true);
        }, ms);
    });
};
