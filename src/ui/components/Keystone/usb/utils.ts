import { getKeystoneDevices, StatusCode, TransportWebUSB } from '@keystonehq/hw-transport-webusb';

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
  if (error.message === 'USB_PERMISSIONS_NOT_AVAILABLE') {
    return 'missing_browser_permissions_please_grant_keystone_permissions';
  }

  if (error.transportErrorCode === StatusCode.PRS_PARSING_REJECTED) {
    return 'request_was_rejected_to_proceed_please_reauthorize';
  }
  if (error.transportErrorCode === StatusCode.PRS_PARSING_DISALLOWED) {
    return 'please_reconnect_the_keystone_on_home_screen_and_reauthorize';
  }

  return 'communication_with_the_keystone_device_failed_please_ensure_the_keystone_is_connected_and_try_again';
}
