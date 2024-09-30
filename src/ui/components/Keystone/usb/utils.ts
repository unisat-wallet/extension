import { TransportWebUSB, getKeystoneDevices } from '@keystonehq/hw-transport-webusb';

export async function createKeystoneTransport() {
  if ((await getKeystoneDevices()).length <= 0) {
    try {
      await TransportWebUSB.requestPermission();
    } catch (e) {
      throw new Error('USB_PERMISSIONS_NOT_AVAILABLE');
    }
  }

  const transport = await TransportWebUSB.connect({
    timeout: 100000
  });
  await transport.close();
  return transport;
}
