import en from 'antd/es/locale/en_US';
import message from 'antd/lib/message';
import ReactDOM from 'react-dom/client';
import { IdleTimerProvider } from 'react-idle-timer';
import { Provider } from 'react-redux';

import { EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import { PriceProvider } from '@/ui/provider/PriceProvider';
import AccountUpdater from '@/ui/state/accounts/updater';
import '@/ui/styles/global.less';
import browser from 'webextension-polyfill';

import { RequestParams } from '@/shared/types/Request';
import { ActionComponentProvider } from './components/ActionComponent';
import { AppDimensions } from './components/Responsive';
import AsyncMainRoute from './pages/MainRoute';
import store from './state';
import { WalletController, WalletProvider } from './utils';

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
    browser.runtime.getPlatformInfo().then((info) => {
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
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, fontFaceSheet];
        }
    });
}

const { PortMessage } = Message;

const portMessageChannel = new PortMessage();

portMessageChannel.connect('popup');

const wallet = new Proxy<WalletController>({} as WalletController, {
    get(_, key: keyof WalletController) {
        return function (...params: Parameters<WalletController[typeof key]>) {
            if (typeof key !== 'string') throw new Error('Invalid key');

            return portMessageChannel.request({
                type: 'controller',
                method: key,
                params
            });
        };
    }
});


portMessageChannel.listen((data) => {
    if (data.type === 'broadcast') {
        eventBus.emit(data.method, data.params);
    }

    return Promise.resolve();
});

// TODO (typing): As it passes data to request function, assumed that the data is RequestParams type
// but broadcastToBackground event is not emitted anywhere. So, check it again when there is a real usage
eventBus.addEventListener(EVENTS.broadcastToBackground, async (params: unknown) => {
    const data = params as RequestParams;
    await portMessageChannel.request({
        type: 'broadcast',
        method: data.method,
        params: data.params
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

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <Provider store={store}>
            <WalletProvider {...antdConfig} wallet={wallet}>
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
} else {
    console.error("Root element not found.");
}
