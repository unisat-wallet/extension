import log from 'loglevel';

import { initPlatformEnv } from '@/shared/initPlatformEnv';
import { restoreAppState } from './init';
import { initInstallEvent } from './runtime/install';
import { initKeepAlive } from './runtime/keepAlive';
import { initMessaging } from './runtime/messaging';
import { initPhishingDetect } from './runtime/phishingDetect';
import { initSidePanel } from './runtime/sidepanel';
import { initWindow } from './runtime/window';

log.setDefaultLevel('error');
if (process.env.NODE_ENV === 'development') {
  // log.setLevel('debug');
}

async function bootstrap() {
  restoreAppState().then(() => {
    initSidePanel();
  });
  initPlatformEnv();
  initMessaging();
  initInstallEvent();
  initKeepAlive();
  initWindow();
  initPhishingDetect();
}

bootstrap();
