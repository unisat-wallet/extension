import PortMessage from '@/shared/utils/message/portMessage';
import {
  bgEventBus,
  preferenceService,
  providerController,
  sessionService,
  walletApiService,
  walletController
} from '@unisat/wallet-background';
import { BUS_EVENTS, MESSAGE_TYPE, PORT_CHANNELS } from '@unisat/wallet-shared';
import { browserRuntimeOnConnect } from '../webapi/browser';

export function initMessaging() {
  // for page provider
  browserRuntimeOnConnect((port) => {
    const portName = port.name;

    const pm = new PortMessage(port as any);

    // UI ports
    if (['popup', 'notification', 'tab', 'sidepanel'].includes(portName)) {
      // listen the message from UI
      pm.listen((data) => {
        if (!data?.type) return;

        switch (data.type) {
          case MESSAGE_TYPE.UI_BROADCAST:
            bgEventBus.emit(data.method, data.params);
            break;
          case MESSAGE_TYPE.UI_OPENAPI:
            if (typeof walletApiService[data.method] === 'function') {
              return walletApiService[data.method](...data.params);
            }
            break;
          case MESSAGE_TYPE.UI_CONTROLLER:
          default:
            if (typeof walletController[data.method] === 'function') {
              return walletController[data.method](...data.params);
            }
        }
      });

      // push the message to UI
      const broadcastToUI = (data: any) => {
        pm.request({
          type: MESSAGE_TYPE.BG_BROADCAST,
          method: data.method,
          params: data.params
        });
      };

      bgEventBus.addEventListener(BUS_EVENTS.broadcastToUI, broadcastToUI);

      port.onDisconnect.addListener(() => {
        bgEventBus.removeEventListener(BUS_EVENTS.broadcastToUI, broadcastToUI);
        if (portName === PORT_CHANNELS.POPUP) {
          preferenceService.setPopupOpen(false);
        }
      });

      if (portName === PORT_CHANNELS.POPUP) {
        preferenceService.setPopupOpen(true);
      }

      return;
    } else {
      // page provider port
      pm.listen(async (data) => {
        const sessionId = port.sender?.tab?.id;
        const session = sessionService.getOrCreateSession(sessionId) as any;

        const req = { data, session, port };
        // for background push to respective page
        req.session.pushMessage = (event, data) => {
          // Send a message to the page( SESSION_EVENTS)
          // example:  sessionService.broadcastEvent(SESSION_EVENTS.unlock)
          pm.send(MESSAGE_TYPE.PM_BG_TO_CONTENT, { event, data });
        };

        // handle the request
        return providerController.handleRequest(req);
      });

      port.onDisconnect.addListener(() => {
        // Clean up session if needed
        const sessionId = port.sender?.tab?.id;
        if (sessionId) {
          // Consider session cleanup here if needed
        }
      });
    }
  });
}
