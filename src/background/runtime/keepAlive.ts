import { PlatformEnv } from '@unisat/wallet-shared';

export function initKeepAlive() {
  // MV3 keep-alive code
  if (PlatformEnv.MANIFEST_VERSION === 'mv3') {
    const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
    let alivePort: any = null;

    setInterval(() => {
      if (alivePort == null) {
        alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });
        alivePort.onDisconnect.addListener(() => {
          if (chrome.runtime.lastError) {
            // console.error('Keep-alive port disconnected:', chrome.runtime.lastError);
          }
          alivePort = null;
        });
      }

      if (alivePort) {
        alivePort.postMessage({ content: 'keep alive' });
      }
    }, 5000);
  }
}
