/**
 * Data sources for phishing site lists
 */
const PHISHING_SOURCES = {
  /**
   * Primary source from GitHub raw content
   */
  PRIMARY: 'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/refs/heads/main/src/config.json',

  /**
   * Backup source from CDN
   */
  BACKUP: 'https://cdn.jsdelivr.net/gh/MetaMask/eth-phishing-detect@main/src/config.json',

  /**
   * Unisat phishing list source
   */
  UNISAT: 'https://raw.githubusercontent.com/unisat-wallet/phishing-detect/master/phishing_sites.json'
};

/**
 * Storage key for cached phishing list
 */
const PHISHING_CACHE_KEY = 'phishing_list_fallback';

/**
 * Default timeout for fetch operations in milliseconds
 */
const FETCH_TIMEOUT = 15000;

/**
 * Minimum phishing list cache age before attempting refresh (12 hours)
 */
const MIN_CACHE_AGE = 12 * 60 * 60 * 1000;

/**
 * Fetch with timeout functionality
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @returns Response object
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch phishing list from available sources with fallback mechanisms
 * @param forceRefresh Force refresh from remote sources even if cache is available
 * @returns Phishing configuration object
 */
export const fetchPhishingList = async (forceRefresh = false): Promise<any> => {
  let cachedData: any = null;
  let useCache = false;

  // If not forcing refresh, try to use cache first
  if (!forceRefresh) {
    try {
      cachedData = await getFromLocalCache();
      if (cachedData && cachedData.lastFetchTime) {
        const cacheAge = Date.now() - cachedData.lastFetchTime;

        // If cache is fresh enough, use it directly (but still fetch UNISAT)
        if (cacheAge < MIN_CACHE_AGE) {
          console.log('[Phishing] Using recent cache, age:', Math.round(cacheAge / 60000), 'minutes');
          useCache = true;
        }
      }
    } catch (error) {
      console.error('[Phishing] Cache check failed:', error);
    }
  }

  // If using cache and not forcing refresh, return early for most sources
  // But always fetch UNISAT source
  if (useCache && !forceRefresh) {
    // Create a working copy of cached data for UNISAT updates
    const mergedData = JSON.parse(JSON.stringify(cachedData));

    // Always fetch UNISAT source
    try {
      await fetchAndMergeUnisat(mergedData);

      // Update the cache with the UNISAT updates
      await saveToLocalCache(mergedData);
      return mergedData;
    } catch (error) {
      console.error('[Phishing] UNISAT source fetch failed, using cache only:', error);
      return cachedData;
    }
  }

  // If not using cache, fetch from all sources
  const fetchOptions: RequestInit = {
    cache: 'no-cache',
    headers: {
      Accept: 'application/json'
    }
  };

  const mergedData: any = {
    version: 2,
    tolerance: 1,
    fuzzylist: [],
    whitelist: [],
    blacklist: [],
    lastFetchTime: Date.now(),
    sources: []
  };

  let hasAnySourceSucceeded = false;

  try {
    const response = await fetchWithTimeout(PHISHING_SOURCES.PRIMARY, fetchOptions);

    if (response.ok) {
      const data = await response.json();
      mergePhishingData(mergedData, data);
      mergedData.sources.push('PRIMARY');
      hasAnySourceSucceeded = true;
      console.log('[Phishing] Successfully fetched from PRIMARY source');
    }
  } catch (error) {
    console.error('[Phishing] Primary source fetch failed:', error);
  }

  try {
    const response = await fetchWithTimeout(PHISHING_SOURCES.BACKUP, fetchOptions);

    if (response.ok) {
      const data = await response.json();
      // Merge data
      mergePhishingData(mergedData, data);
      mergedData.sources.push('BACKUP');
      hasAnySourceSucceeded = true;
      console.log('[Phishing] Successfully fetched from BACKUP source');
    }
  } catch (error) {
    console.error('[Phishing] Backup source fetch failed:', error);
  }

  // Always try to fetch UNISAT source
  try {
    await fetchAndMergeUnisat(mergedData);
    hasAnySourceSucceeded = true;
  } catch (error) {
    console.error('[Phishing] Unisat source fetch failed:', error);
  }

  // If at least one source succeeded, save merged data to cache
  if (hasAnySourceSucceeded) {
    await saveToLocalCache(mergedData);
    return mergedData;
  }

  // All remote sources failed, try using cache (regardless of age)
  try {
    cachedData = await getFromLocalCache();
    if (cachedData) {
      console.warn('[Phishing] Using cached data as all remote sources failed');
      return cachedData;
    }
  } catch (error) {
    console.error('[Phishing] Cache retrieval failed:', error);
  }

  // All sources failed
  throw new Error('Failed to fetch phishing list from all available sources');
};

/**
 * Fetches UNISAT phishing list and merges it into target data
 * This function is separated to allow always fetching UNISAT data
 * @param targetData The data object to merge UNISAT data into
 * @returns Promise<boolean> indicating success
 */
async function fetchAndMergeUnisat(targetData: any): Promise<boolean> {
  const fetchOptions: RequestInit = {
    cache: 'no-cache',
    headers: {
      Accept: 'application/json'
    }
  };

  const response = await fetchWithTimeout(PHISHING_SOURCES.UNISAT, fetchOptions);

  if (response.ok) {
    const data = await response.json();
    mergePhishingData(targetData, data);

    // Only add to sources if not already there
    if (!targetData.sources.includes('UNISAT')) {
      targetData.sources.push('UNISAT');
    }

    console.log('[Phishing] Successfully fetched from UNISAT source');
    return true;
  }

  throw new Error('Failed to fetch from UNISAT source');
}

function mergePhishingData(target: any, source: any): void {
  if (Array.isArray(source.blacklist)) {
    target.blacklist = [...new Set([...target.blacklist, ...source.blacklist])];
  }

  if (Array.isArray(source.whitelist)) {
    target.whitelist = [...new Set([...target.whitelist, ...source.whitelist])];
  }

  if (Array.isArray(source.fuzzylist)) {
    target.fuzzylist = [...new Set([...target.fuzzylist, ...source.fuzzylist])];
  }

  if (typeof source.tolerance === 'number' && (!target.tolerance || source.tolerance > target.tolerance)) {
    target.tolerance = source.tolerance;
  }
}

/**
 * Save phishing list to local cache
 * @param data Phishing data to cache
 * @returns Promise resolving to success status
 */
async function saveToLocalCache(data: any): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    try {
      chrome.storage.local.set({ [PHISHING_CACHE_KEY]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(true);
      });
    } catch (error) {
      console.error('[Phishing] Failed to save to local cache:', error);
      reject(error);
    }
  });
}

/**
 * Retrieve phishing list from local cache
 * @returns Promise resolving to cached data or null
 */
async function getFromLocalCache(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(PHISHING_CACHE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (result && result[PHISHING_CACHE_KEY]) {
          resolve(result[PHISHING_CACHE_KEY]);
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      console.error('[Phishing] Failed to get from local cache:', error);
      reject(error);
    }
  });
}

/**
 * Clear the phishing list cache
 * @returns Promise resolving to success status
 */
export async function clearPhishingCache(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    try {
      chrome.storage.local.remove(PHISHING_CACHE_KEY, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        console.log('[Phishing] Cache cleared successfully');
        resolve(true);
      });
    } catch (error) {
      console.error('[Phishing] Failed to clear cache:', error);
      reject(error);
    }
  });
}

/**
 * Export cached phishing list to a downloadable file
 * Useful for debugging
 * @returns Promise resolving to a Blob URL
 */
export async function exportPhishingList(): Promise<string> {
  try {
    // Try to get the latest data
    let data;
    try {
      data = await fetchPhishingList();
    } catch (error) {
      // If fetch fails, try to get from cache
      data = await getFromLocalCache();
      if (!data) {
        throw new Error('No phishing data available to export');
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('[Phishing] Export failed:', error);
    throw error;
  }
}

/**
 * Get cache statistics
 * @returns Promise resolving to cache statistics
 */
export async function getPhishingCacheStats(): Promise<{
  available: boolean;
  lastFetchTime: number | null;
  age: number | null;
  size: number | null;
  entries: {
    blacklist: number;
    whitelist: number;
    fuzzylist: number;
  } | null;
}> {
  try {
    const cachedData = await getFromLocalCache();
    if (!cachedData) {
      return {
        available: false,
        lastFetchTime: null,
        age: null,
        size: null,
        entries: null
      };
    }

    const size = JSON.stringify(cachedData).length;
    const lastFetchTime = cachedData.lastFetchTime || null;
    const age = lastFetchTime ? Date.now() - lastFetchTime : null;

    return {
      available: true,
      lastFetchTime,
      age,
      size,
      entries: {
        blacklist: Array.isArray(cachedData.blacklist) ? cachedData.blacklist.length : 0,
        whitelist: Array.isArray(cachedData.whitelist) ? cachedData.whitelist.length : 0,
        fuzzylist: Array.isArray(cachedData.fuzzylist) ? cachedData.fuzzylist.length : 0
      }
    };
  } catch (error) {
    console.error('[Phishing] Failed to get cache stats:', error);
    return {
      available: false,
      lastFetchTime: null,
      age: null,
      size: null,
      entries: null
    };
  }
}
