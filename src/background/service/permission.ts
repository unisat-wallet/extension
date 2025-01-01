import { max } from 'lodash';
import LRUCache from 'lru-cache';

import { createPersistStore } from '@/background/utils';
import { CHAINS_ENUM, INTERNAL_REQUEST_ORIGIN } from '@/shared/constant';

export interface ConnectedSite {
    origin: string;
    icon: string;
    name: string;
    chain: CHAINS_ENUM;
    e?: number;
    isSigned: boolean;
    isTop: boolean;
    order?: number;
    isConnected: boolean;
}

export interface PermissionStore {
    // We'll store the entries as an array of { k, v }
    dumpCache: Array<{ k: string; v: ConnectedSite }>;
}

class PermissionService {
    store: PermissionStore = {
        dumpCache: []
    };

    lruCache: LRUCache<string, ConnectedSite> | undefined;

    init = async () => {
        const storage = await createPersistStore<PermissionStore>({
            name: 'permission'
        });
        this.store = storage || this.store;

        // Provide at least one of `max`, `ttl`, or `maxSize` to be safe.
        this.lruCache = new LRUCache<string, ConnectedSite>({
            max: 500,
            updateAgeOnGet: true // typical for an LRU
        });

        // Manually load items from store into the LRU
        for (const entry of this.store.dumpCache || []) {
            this.lruCache.set(entry.k, entry.v);
        }
    };

    sync = () => {
        if (!this.lruCache) return;
        // Manually dump current cache into store
        // `cache.entries()` returns an iterable of [key, value]
        // We'll store it as { k, v } for each pair, similar to v5's dump/load approach
        this.store.dumpCache = [...this.lruCache.entries()].map(([k, v]) => ({
            k,
            v
        }));
    };

    getWithoutUpdate = (key: string) => {
        if (!this.lruCache) return;
        // .peek() was removed in older versions but reintroduced in newer ones.
        // If you still need to do a peek-like read without updating LRU ordering:
        // v9+ does have `cache.peek(key)`, so it should work.
        return this.lruCache.peek(key);
    };

    getSite = (origin: string) => {
        return this.lruCache?.get(origin);
    };

    setSite = (site: ConnectedSite) => {
        if (!this.lruCache) return;
        this.lruCache.set(site.origin, site);
        this.sync();
    };

    addConnectedSite = (
        origin: string,
        name: string,
        icon: string,
        defaultChain: CHAINS_ENUM,
        isSigned = false
    ) => {
        if (!this.lruCache) return;

        this.lruCache.set(origin, {
            origin,
            name,
            icon,
            chain: defaultChain,
            isSigned,
            isTop: false,
            isConnected: true
        });
        this.sync();
    };

    touchConnectedSite = (origin: string) => {
        if (!this.lruCache) return;
        if (origin === INTERNAL_REQUEST_ORIGIN) return;
        // get() will update recency
        this.lruCache.get(origin);
        this.sync();
    };

    updateConnectSite = (
        origin: string,
        value: Partial<ConnectedSite>,
        partialUpdate?: boolean
    ) => {
        if (!this.lruCache?.has(origin)) return;
        if (origin === INTERNAL_REQUEST_ORIGIN) return;

        if (partialUpdate) {
            const currentSite = this.lruCache.get(origin);
            if (!currentSite) return;
            const updatedSite = { ...currentSite, ...value };
            this.lruCache.set(origin, updatedSite);
        } else {
            this.lruCache.set(origin, value as ConnectedSite);
        }

        this.sync();
    };

    hasPermission = (origin: string) => {
        if (!this.lruCache) return false;
        if (origin === INTERNAL_REQUEST_ORIGIN) return true;

        const site = this.lruCache.get(origin);
        return !!site?.isConnected;
    };

    setRecentConnectedSites = (sites: ConnectedSite[]) => {
        if (!this.lruCache) return;

        // Clear existing LRU first
        this.lruCache.clear();

        // Add the connected sites first
        sites.forEach((item) => {
            if (this.lruCache) {
                this.lruCache.set(item.origin, item);
            }
        });

        // Now add the old or disconnected ones
        //const oldValues = [...this.lruCache.entries()].map(([k]) => k);
        // The above line might be optional, as we just did clear().

        // Another approach: if you wanted to keep old *disconnected* sites from
        // the *existing* cache:
        // for (const [k, v] of oldCacheEntries) {
        //   if (!v.isConnected) {
        //     this.lruCache.set(k, v);
        //   }
        // }

        // Or simply store the disconnected from the existing store:
        const storedDisconnected = (this.store.dumpCache || [])
            .filter(({ v }) => !v.isConnected)
            .map(({ k, v }) => ({ k, v }));

        for (const { k, v } of storedDisconnected) {
            this.lruCache.set(k, v);
        }

        this.sync();
    };

    getRecentConnectedSites = () => {
        if (!this.lruCache) return [];
        const sites = [...this.lruCache.values()].filter((item) => item.isConnected);
        const pinnedSites = sites
            .filter((item) => item.isTop)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const recentSites = sites.filter((item) => !item.isTop);
        return [...pinnedSites, ...recentSites];
    };

    getConnectedSites = () => {
        if (!this.lruCache) return [];
        return [...this.lruCache.values()].filter((item) => item.isConnected);
    };

    getConnectedSite = (key: string) => {
        const site = this.lruCache?.get(key);
        if (site?.isConnected) {
            return site;
        }
    };

    topConnectedSite = (origin: string, order?: number) => {
        const site = this.getConnectedSite(origin);
        if (!site || !this.lruCache) return;
        order =
            order ??
            (max(this.getRecentConnectedSites().map((item) => item.order)) ?? 0) + 1;

        this.updateConnectSite(origin, { ...site, order, isTop: true });
    };

    unpinConnectedSite = (origin: string) => {
        const site = this.getConnectedSite(origin);
        if (!site || !this.lruCache) return;
        this.updateConnectSite(origin, { ...site, isTop: false });
    };

    removeConnectedSite = (origin: string) => {
        if (!this.lruCache) return;
        const site = this.getConnectedSite(origin);
        if (!site) {
            return;
        }
        this.setSite({
            ...site,
            isConnected: false
        });
        this.sync();
    };

    getSitesByDefaultChain = (chain: CHAINS_ENUM) => {
        if (!this.lruCache) return [];
        return [...this.lruCache.values()].filter((item) => item.chain === chain);
    };

    isInternalOrigin = (origin: string) => {
        return origin === INTERNAL_REQUEST_ORIGIN;
    };
}

export default new PermissionService();
