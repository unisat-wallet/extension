import { PlatformEnv } from '@unisat/wallet-shared';

PlatformEnv.VERSION = process.env.release!;
PlatformEnv.CHANNEL = process.env.channel!;
PlatformEnv.PLATFORM = 'extension';
PlatformEnv.MANIFEST_VERSION = process.env.manifest!;
PlatformEnv.REVIEW_URL =
  'https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo/reviews';

export const initPlatformEnv = async () => {
  //   await deviceService.preloadDeviceUUID();
  //   PlatformEnv.UDID2 = deviceService.getDeviceUUID();
};
