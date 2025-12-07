/**
 * Network monitoring module
 * Monitors network requests and reports errors
 */

interface NetworkErrorMessage {
  type: 'REPORT_NETWORK_ERROR';
  url: string;
  error: string;
  status: number | string;
}

/**
 * Send network error report to background
 */
function reportNetworkError(params: Omit<NetworkErrorMessage, 'type'>): void {
  chrome.runtime.sendMessage({
    type: 'REPORT_NETWORK_ERROR',
    ...params
  });
}

/**
 * Setup network error detection listeners
 */
export function setupNetworkMonitoring(): void {
  // Monitor image and link load errors
  window.addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) {
        const url = event.target.src;
        if (url) {
          reportNetworkError({
            url,
            error: 'Image load failed',
            status: 'error'
          });
        }
      } else if (event.target instanceof HTMLAnchorElement) {
        const url = event.target.href;
        if (url) {
          reportNetworkError({
            url,
            error: 'Link load failed',
            status: 'error'
          });
        }
      }
    },
    true
  );

  // Monitor fetch errors
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);
      if (!response.ok) {
        const requestUrl =
          typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;

        reportNetworkError({
          url: requestUrl,
          error: `HTTP ${response.status}`,
          status: response.status
        });
      }
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const requestUrl =
        typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;

      reportNetworkError({
        url: requestUrl,
        error: errorMessage,
        status: 'network_error'
      });
      throw error;
    }
  };

  // Monitor XHR errors
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async = true,
    username?: string | null,
    password?: string | null
  ) {
    this.addEventListener('error', () => {
      reportNetworkError({
        url: url.toString(),
        error: 'XHR failed',
        status: this.status
      });
    });

    this.addEventListener('load', () => {
      if (this.status >= 400) {
        reportNetworkError({
          url: url.toString(),
          error: `HTTP ${this.status}`,
          status: this.status
        });
      }
    });

    return originalXHROpen.call(this, method, url, async, username || null, password || null);
  };
}
