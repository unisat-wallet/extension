/**
 * Phishing detection module
 * Handles phishing site detection and redirection
 */

/**
 * Check if the current site is a phishing site
 * @returns Promise<boolean> - true if the site is phishing
 */
export async function checkPhishing(): Promise<boolean> {
  try {
    const hostname = window.location.hostname;
    const isPhishing = await new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'CHECK_PHISHING',
          hostname,
          source: 'content_script'
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Message channel error:', chrome.runtime.lastError);
            resolve(false);
            return;
          }
          resolve(response);
        }
      );
    });

    if (isPhishing) {
      try {
        // Send redirect message
        chrome.runtime.sendMessage(
          {
            type: 'REDIRECT_TO_PHISHING_PAGE',
            hostname
          },
          () => {
            if (chrome.runtime.lastError) {
              console.warn('Redirect message error:', chrome.runtime.lastError);
            }
          }
        );
      } catch (e) {
        console.warn('Failed to send redirect message:', e);
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to check phishing:', e);
    return false;
  }
}

/**
 * Initialize phishing detection on page load
 */
export async function initializePhishingDetection(): Promise<void> {
  await checkPhishing();
}

/**
 * Setup phishing detection event listeners
 */
export function setupPhishingListeners(): void {
  let checkTimeout: NodeJS.Timeout | null = null;

  // Page navigation listener with debounce
  window.addEventListener('popstate', () => {
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }
    checkTimeout = setTimeout(checkPhishing, 100);
  });

  // Page visibility change listener
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkPhishing();
    }
  });
}
