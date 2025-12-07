/**
 * Content Script Entry Point
 * Coordinates all content script modules
 */
import { initializeScriptInjection } from './injection/scriptInjector';
import { setupNetworkMonitoring } from './monitoring/network';
import { initializePhishingDetection, setupPhishingListeners } from './phishing/detector';
import { setupNavigationListeners } from './phishing/navigation';

// Initialize phishing detection immediately
(async function initialize() {
  // Run initial phishing check
  await initializePhishingDetection();

  // Inject provider script if conditions are met
  initializeScriptInjection();

  // Setup all listeners
  setupPhishingListeners();
  setupNavigationListeners();
  setupNetworkMonitoring();
})();
