import en from 'antd/es/locale/en_US';
import message from 'antd/lib/message';
import ReactDOM from 'react-dom/client';
import { IdleTimerProvider } from 'react-idle-timer';
import { Provider } from 'react-redux';

import browser from '@/background/webapi/browser';
import { EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import { PriceProvider } from '@/ui/provider/PriceProvider';
import AccountUpdater from '@/ui/state/accounts/updater';
import '@/ui/styles/global.less';

import { ActionComponentProvider } from './components/ActionComponent';
import { AppDimensions } from './components/Responsive';
import AsyncMainRoute from './pages/MainRoute';
import store from './state';
import { WalletProvider } from './utils';

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
            (document).adoptedStyleSheets = [...(document).adoptedStyleSheets, fontFaceSheet];
        }
    });
}

const { PortMessage } = Message;

const portMessageChannel = new PortMessage();

portMessageChannel.connect('popup');

// TODO (typing): Since the functions passed into the proxy are determined at runtime,
// it may not worth to define union of types here. (Check using generics)
const wallet: Record<string, any> = new Proxy(
    {},
    {
        get(_, key) {
            return function (...params: any) {
                if (typeof key !== 'string') throw new Error('Invalid key');

                return portMessageChannel.request({
                    type: 'controller',
                    method: key,
                    params
                });
            };
        }
    }
);

portMessageChannel.listen((data) => {
    if (data.type === 'broadcast') {
        eventBus.emit(data.method, data.params);
    }

    return Promise.resolve();
});

eventBus.addEventListener(EVENTS.broadcastToBackground, async (data) => {
    await portMessageChannel.request({
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

// wallet.getLocale().then((locale) => {
//   addResourceBundle(locale).then(() => {
//     i18n.changeLanguage(locale);
//     // ReactDOM.render(<Views wallet={wallet} />, document.getElementById('root'));
//     const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
//     root.render(
//       <Provider store={store}>
//         <WalletProvider {...antdConfig} wallet={wallet as any}>
//           <AppDimensions>
//             <Updaters />
//             <AsyncMainRoute />
//           </AppDimensions>
//         </WalletProvider>
//       </Provider>
//     );
//   });
// });

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <Provider store={store}>
        <WalletProvider {...antdConfig} wallet={wallet as any}>
            <ActionComponentProvider>
                <AppDimensions>
                    <PriceProvider>
                        <IdleTimerProvider
                            onAction={() => {
                                wallet.setLastActiveTime();
                            }}>
                            <Updaters />
                            <AsyncMainRoute />
                        </IdleTimerProvider>
                    </PriceProvider>
                </AppDimensions>
            </ActionComponentProvider>
        </WalletProvider>
    </Provider>
);
