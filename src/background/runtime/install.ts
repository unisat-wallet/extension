// runtime/install.ts
import { openExtensionInTab } from '@/ui/web/tabs';
import { isAppStateRestored } from '../init/restore';
import { browserRuntimeOnInstalled } from '../webapi/browser';

const addAppInstalledEvent = () => {
  if (isAppStateRestored()) {
    openExtensionInTab('index.html', {});
    return;
  }
  setTimeout(() => {
    addAppInstalledEvent();
  }, 1000);
};

export function initInstallEvent() {
  browserRuntimeOnInstalled((details) => {
    if (details.reason !== 'install') return;
    addAppInstalledEvent();
  });
}
