import { phishingController } from '@unisat/wallet-background';

export function initPhishingDetect() {
  // Initialize phishing detector
  phishingController.init();
}
