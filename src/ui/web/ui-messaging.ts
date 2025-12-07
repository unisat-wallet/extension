/**
 * Event Bus Service
 * Handles communication between UI and background via event bus
 */
import { Message } from '@/shared/utils';
import { BUS_EVENTS, MESSAGE_TYPE, PORT_CHANNELS } from '@unisat/wallet-shared';
import { uiEventBus } from '@unisat/wallet-state';

const { PortMessage } = Message;

/**
 * Setup event listeners for UI and background communication
 */
export function setupEventBusListeners(portMessageChannel: InstanceType<typeof PortMessage>): void {
  // Listen for broadcast messages from background
  // background -> UI
  portMessageChannel.listen((data) => {
    if (data.type === MESSAGE_TYPE.BG_BROADCAST) {
      uiEventBus.emit(data.method, data.params);
    }
  });

  // Listen for UI events to broadcast to background
  // No use for now
  // UI -> background
  uiEventBus.addEventListener(BUS_EVENTS.broadcastToBG, (data) => {
    portMessageChannel.request({
      type: MESSAGE_TYPE.UI_BROADCAST,
      method: data.method,
      params: data.data
    });
  });
}

/**
 * Create a port message channel for communication with background
 */
export function createPortMessageChannel() {
  const portMessageChannel = new PortMessage();
  portMessageChannel.connect(PORT_CHANNELS.POPUP);
  return portMessageChannel;
}

export interface WalletProxy {
  openapi: Record<string, (...args: any[]) => Promise<any>>;
  [key: string]: any;
}

/**
 * Create a wallet proxy that forwards method calls to the background service
 */
export function createWalletProxy(portMessageChannel: InstanceType<typeof PortMessage>): WalletProxy {
  const wallet: Record<string, any> = new Proxy(
    {},
    {
      get(obj, key) {
        switch (key) {
          case 'openapi':
            return new Proxy(
              {},
              {
                get(obj, key) {
                  return function (...params: any) {
                    return portMessageChannel.request({
                      type: MESSAGE_TYPE.UI_OPENAPI,
                      method: key,
                      params
                    });
                  };
                }
              }
            );
          default:
            return function (...params: any) {
              return portMessageChannel.request({
                type: MESSAGE_TYPE.UI_CONTROLLER,
                method: key,
                params
              });
            };
        }
      }
    }
  );

  return wallet as WalletProxy;
}
