/**
 * UI Entry Point
 * Main entry file for the extension UI
 */
import ReactDOM from 'react-dom/client';
import { IdleTimerProvider } from 'react-idle-timer';
import { Provider } from 'react-redux';

import { initPlatformEnv } from '@/shared/initPlatformEnv';
import '@/ui/styles/global.less';
import { AccountUpdater, createAppStore, PriceProvider, WalletProvider } from '@unisat/wallet-state';

import { i18nService } from '@/shared/utils/i18n';
import { AppDimensions } from './components/Responsive';
import AsyncMainRoute from './pages/MainRoute';
import { DeviceProvider } from './providers/DeviceProvider';
import { I18nProvider } from './providers/I18nProvider';
import { ToolsProvider } from './providers/ToolsProvider';
import { getAntdConfig, initializeAppConfig } from './utils/appConfig';
import { applyExternalMonitorFix } from './utils/platformFixes';
import { createPortMessageChannel, createWalletProxy, setupEventBusListeners } from './web/ui-messaging';

// Initialize platform environment
initPlatformEnv();

// Initialize application configuration
initializeAppConfig();

// Apply platform-specific fixes
applyExternalMonitorFix();

const store = createAppStore();

i18nService.init({});

// Setup communication channels
const portMessageChannel = createPortMessageChannel();
const wallet = createWalletProxy(portMessageChannel);

// Setup event bus listeners
setupEventBusListeners(portMessageChannel);

// Get Ant Design configuration
const antdConfig = getAntdConfig();

// Render application
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Provider store={store}>
    <WalletProvider {...antdConfig} wallet={wallet as any}>
      <DeviceProvider>
        <I18nProvider>
          <ToolsProvider>
            <AppDimensions>
              <PriceProvider>
                <IdleTimerProvider
                  onAction={() => {
                    wallet.setLastActiveTime();
                  }}>
                  <AccountUpdater />
                  <AsyncMainRoute />
                </IdleTimerProvider>
              </PriceProvider>
            </AppDimensions>
          </ToolsProvider>
        </I18nProvider>
      </DeviceProvider>
    </WalletProvider>
  </Provider>
);

// document.body.style.visibility = 'visible';
