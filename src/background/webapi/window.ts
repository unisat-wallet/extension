import { EventEmitter } from 'events';

import { IS_WINDOWS } from '@/shared/constant';

import browser, {
  browserWindowsCreate,
  browserWindowsGetCurrent,
  browserWindowsRemove,
  browserWindowsUpdate
} from './browser';

const event = new EventEmitter();

// if focus other windows, then reject the approval
browser.windows.onFocusChanged.addListener((winId) => {
  event.emit('windowFocusChange', winId);
});

browser.windows.onRemoved.addListener((winId) => {
  event.emit('windowRemoved', winId);
});

const BROWSER_HEADER = 80;
const WINDOW_SIZE = {
  width: 400 + (IS_WINDOWS ? 14 : 0), // idk why windows cut the width.
  height: 600
};

const create = async ({ url, ...rest }): Promise<number | undefined> => {
  const {
    top: cTop,
    left: cLeft,
    width
  } = await browserWindowsGetCurrent({
    windowTypes: ['normal']
  } as any);

  const top = cTop! + BROWSER_HEADER;
  const left = cLeft! + width! - WINDOW_SIZE.width;

  const currentWindow = await browserWindowsGetCurrent();
  let win;
  if (currentWindow.state === 'fullscreen') {
    // browser.windows.create not pass state to chrome
    win = await browserWindowsCreate({
      focused: true,
      url,
      type: 'popup',
      ...rest,
      width: undefined,
      height: undefined,
      left: undefined,
      top: undefined,
      state: 'fullscreen'
    });
  } else {
    win = await browserWindowsCreate({
      focused: true,
      url,
      type: 'popup',
      top,
      left,
      ...WINDOW_SIZE,
      ...rest
    });
  }

  // shim firefox
  if (win.left !== left) {
    await browserWindowsUpdate(win.id!, { left, top });
  }

  return win.id;
};

const remove = async (winId) => {
  return browserWindowsRemove(winId);
};

const openNotification = ({ route = '', ...rest } = {}): Promise<number | undefined> => {
  const url = `notification.html${route && `#${route}`}`;

  return create({ url, ...rest });
};

export default {
  openNotification,
  event,
  remove
};
