import en from 'antd/es/locale/en_US';
import message from 'antd/lib/message';
import { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import browser from '@/background/webapi/browser';
import { EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import AccountUpdater from '@/ui/state/accounts/updater';
import '@/ui/styles/antd.less';
import '@/ui/styles/rc-virtual-list.less';
import '@/ui/styles/tailwind.less';
import i18n, { addResourceBundle } from '@/ui/utils/i18n';

import { AppDimensions } from './components/Responsive';
import store from './state';
import { WalletProvider } from './utils';

// import 'default-passive-events'

const AsyncMainRoute = lazy(() => import('./pages/MainRoute'));

message.config({
  maxCount: 1
});
const antdConfig = {
  locale: en
};

// For fix chrome extension render problem in external screen
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  browser.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
      (document as any).adoptedStyleSheets = [...(document as any).adoptedStyleSheets, fontFaceSheet];
    }
  });
}

const { PortMessage } = Message;

const portMessageChannel = new PortMessage();

portMessageChannel.connect('popup');

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
                    type: 'openapi',
                    method: key,
                    params
                  });
                };
              }
            }
          );
          break;
        default:
          return function (...params: any) {
            return portMessageChannel.request({
              type: 'controller',
              method: key,
              params
            });
          };
      }
    }
  }
);

portMessageChannel.listen((data) => {
  if (data.type === 'broadcast') {
    eventBus.emit(data.method, data.params);
  }
});

eventBus.addEventListener(EVENTS.broadcastToBackground, (data) => {
  portMessageChannel.request({
    type: 'broadcast',
    method: data.method,
    params: data.data
  });
});

function Updaters() {
  return (
    <>
      <AccountUpdater />
    </>
  );
}

wallet.getLocale().then((locale) => {
  addResourceBundle(locale).then(() => {
    i18n.changeLanguage(locale);
    // ReactDOM.render(<Views wallet={wallet} />, document.getElementById('root'));
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

    root.render(
      <Provider store={store}>
        <WalletProvider {...antdConfig} wallet={wallet as any}>
          <AppDimensions>
            <Updaters />
            <AsyncMainRoute />
          </AppDimensions>
        </WalletProvider>
      </Provider>
    );
  });
});
