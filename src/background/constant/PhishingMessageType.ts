/**
 * Message types for phishing protection
 * These constants are used for communication between different parts of the extension
 * related to phishing detection and protection features.
 */
export enum PhishingMessageType {
  /**
   * Check if a hostname is in the phishing blacklist
   *
   * Expected parameters:
   * - hostname: string - The hostname to check
   *
   * Response:
   * - isPhishing: boolean - Whether the hostname is in the blacklist
   */
  CHECK_PHISHING = 'CHECK_PHISHING',

  /**
   * Request to redirect the current tab to the phishing warning page
   *
   * Expected parameters:
   * - hostname: string - The hostname that triggered the detection
   * - url: string - The original URL that was blocked
   *
   * Response:
   * - success: boolean - Whether the redirect was successful
   * - error?: string - Error message if the redirect failed
   */
  REDIRECT_TO_PHISHING_PAGE = 'REDIRECT_TO_PHISHING_PAGE',

  /**
   * Add a hostname to the phishing whitelist to skip protection
   * This is used when a user chooses to proceed to a site despite the warning
   *
   * Expected parameters:
   * - hostname: string - The hostname to whitelist
   *
   * Response:
   * - success: boolean - Whether the hostname was added to the whitelist
   */
  SKIP_PHISHING_PROTECTION = 'SKIP_PHISHING_PROTECTION',

  /**
   * Alternative name for SKIP_PHISHING_PROTECTION
   * Adds a domain to the whitelist
   *
   * Expected parameters:
   * - domain: string - The domain to whitelist
   *
   * Response:
   * - success: boolean - Whether the domain was added to the whitelist
   */
  ADD_TO_WHITELIST = 'ADD_TO_WHITELIST',

  /**
   * Check if a navigation should be blocked due to phishing protection
   * This is used during navigation events to determine if a redirect is needed
   *
   * Expected parameters:
   * - url: string - The URL being navigated to
   *
   * Response:
   * - isPhishing: boolean - Whether the URL is considered a phishing site
   * - redirected: boolean - Whether a redirect was initiated
   * - skipped?: boolean - Whether the check was skipped (e.g., for extension pages)
   */
  CHECK_NAVIGATION = 'CHECK_NAVIGATION',

  /**
   * Force an immediate update of the phishing lists from remote source
   *
   * Expected parameters: none
   *
   * Response:
   * - success: boolean - Whether the update was successful
   * - error?: string - Error message if the update failed
   */
  FORCE_UPDATE_PHISHING_LIST = 'FORCE_UPDATE_PHISHING_LIST',

  /**
   * Alternative name for FORCE_UPDATE_PHISHING_LIST
   * Forces a reload of the phishing lists
   *
   * Expected parameters: none
   *
   * Response:
   * - success: boolean - Whether the reload was successful
   * - message: string - Status message
   */
  FORCE_RELOAD_PHISHING_LISTS = 'FORCE_RELOAD_PHISHING_LISTS',

  /**
   * Get statistics about the phishing protection
   * Returns information about blacklist and whitelist sizes
   *
   * Expected parameters: none
   *
   * Response:
   * - stats: object - Object containing phishing configuration and statistics
   */
  GET_PHISHING_STATS = 'GET_PHISHING_STATS'
}
