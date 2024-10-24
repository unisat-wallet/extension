import { TransportWebUSB, getKeystoneDevices, StatusCode } from '@keystonehq/hw-transport-webusb';

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


export function handleKeystoneUSBError(error) {
  if (error.message === "USB_PERMISSIONS_NOT_AVAILABLE") {
    return 'Missing browser permissions, please grant Keystone permissions';
  }

  if (error.transportErrorCode === StatusCode.PRS_PARSING_REJECTED) {
    return `Request was Rejected. To Proceed,please reauthorize`;
  }
  if (error.transportErrorCode === StatusCode.PRS_PARSING_DISALLOWED) {
    return 'Please reconnect the Keystone on home screen and reauthorize.';
  }

  return 'Communication with the Keystone device failed. Please ensure the Keystone is connected, and try again.';
}
