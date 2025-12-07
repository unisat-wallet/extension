import { notificationService } from '@unisat/wallet-background';
import { winMgr } from '../webapi';

export function initWindow() {
  winMgr.event.on('windowRemoved', (winId: number) => {
    if (winId === notificationService.notifiWindowId) {
      notificationService.notifiWindowId = 0;
      notificationService.rejectApproval();
    }
  });

  winMgr.event.on('windowFocusChange', (winId: number) => {
    // todo
  });

  notificationService.platformOpenWindow = async (winProps) => {
    if (notificationService.notifiWindowId) {
      winMgr.remove(notificationService.notifiWindowId);
    }
    const winId = await winMgr.openNotification(winProps);
    return winId || 1;
  };

  notificationService.platformCloseWindow = async (winId) => {
    await winMgr.remove(winId);
  };
}
