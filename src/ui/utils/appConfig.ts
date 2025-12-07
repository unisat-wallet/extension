/**
 * Application Configuration
 * Centralized configuration for the UI application
 */
import en from 'antd/es/locale/en_US';
import message from 'antd/lib/message';
import log from 'loglevel';

/**
 * Configure logging based on environment
 */
export function setupLogging(): void {
  log.setDefaultLevel('error');
  if (process.env.NODE_ENV === 'development') {
    log.setLevel('debug');
  }
}

/**
 * Configure Ant Design message component
 */
export function setupAntdMessage(): void {
  message.config({
    maxCount: 1
  });
}

/**
 * Get Ant Design configuration
 */
export function getAntdConfig() {
  return {
    locale: en
  };
}

/**
 * Initialize all application configurations
 */
export function initializeAppConfig(): void {
  setupLogging();
  setupAntdMessage();
}
