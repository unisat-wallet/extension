/**
 * Navigation interception module
 * Handles navigation event monitoring and phishing checks
 */

/**
 * Check if a URL is a phishing site
 * @param url - URL to check
 * @returns Promise<boolean> - true if the URL is phishing
 */
async function checkNavigationPhishing(url: string): Promise<boolean> {
  try {
    const result = await new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'CHECK_NAVIGATION',
          url
        },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve(false);
            return;
          }
          resolve(response?.isPhishing);
        }
      );
    });
    return result;
  } catch (e) {
    console.error('[Navigation Check] Error:', e);
    return false;
  }
}

/**
 * Setup navigation interception listeners
 */
export function setupNavigationListeners(): void {
  // Listen for beforeunload events
  window.addEventListener('beforeunload', async (e) => {
    const url = window.location.href;
    const isPhishing = await checkNavigationPhishing(url);

    if (isPhishing) {
      // If it's a phishing site, prevent navigation and show warning
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Listen for click events on links
  document.addEventListener(
    'click',
    async (e) => {
      const element = e.target as HTMLElement;
      let url: string | null = null;

      // Check for links
      if (element instanceof HTMLAnchorElement && element.href) {
        url = element.href;
      }
      // Check other elements that might trigger navigation
      else if (element.hasAttribute('href')) {
        url = element.getAttribute('href');
      }

      if (url) {
        const isPhishing = await checkNavigationPhishing(url);
        if (isPhishing) {
          e.preventDefault();
        }
      }
    },
    true
  );
}
