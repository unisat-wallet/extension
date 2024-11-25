import { ReactElement, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useNavigate as useNavigateOrigin } from 'react-router-dom';

import TxCreateScreen from '@/ui/pages/Wallet/TxCreateScreen';
import { LoadingOutlined } from '@ant-design/icons';

import { Content, Icon } from '../components';
import { accountActions } from '../state/accounts/reducer';
import { useIsReady, useIsUnlocked } from '../state/global/hooks';
import { globalActions } from '../state/global/reducer';
import { useAppDispatch } from '../state/hooks';
import { settingsActions } from '../state/settings/reducer';
import { useWallet } from '../utils';
import AddKeyringScreen from './Account/AddKeyringScreen';
import CreateAccountScreen from './Account/CreateAccountScreen';
import CreateHDWalletScreen from './Account/CreateHDWalletScreen';
import CreateKeystoneWalletScreen from './Account/CreateKeystoneWalletScreen';
import CreatePasswordScreen from './Account/CreatePasswordScreen';
import CreateSimpleWalletScreen from './Account/CreateSimpleWalletScreen';
import SwitchAccountScreen from './Account/SwitchAccountScreen';
import SwitchKeyringScreen from './Account/SwitchKeyringScreen';
import UnlockScreen from './Account/UnlockScreen';
import ApprovalScreen from './Approval/ApprovalScreen';
import ConnectedSitesScreen from './Approval/ConnectedSitesScreen';
import AppTabScrren from './Main/AppTabScreen';
import BoostScreen from './Main/BoostScreen';
import SettingsTabScreen from './Main/SettingsTabScreen';
import WalletTabScreen from './Main/WalletTabScreen';
import WelcomeScreen from './Main/WelcomeScreen';
import Airdrop from './OpNet/Airdrop';
import DeployContract from './OpNet/DeployContract';
import Mint from './OpNet/Mint';
import OpNetTokenScreen from './OpNet/OpNetTokenScreen';
import SendOpNetScreen from './OpNet/SendOpNetScreen';
import SplitUtxoScreen from './OpNet/SplitUtxoScreen';
import Swap from './OpNet/SwapToken';
import AddressTypeScreen from './Settings/AddressTypeScreen';
import AdvancedScreen from './Settings/AdvancedScreen';
import ChangePasswordScreen from './Settings/ChangePasswordScreen';
import EditAccountNameScreen from './Settings/EditAccountNameScreen';
import EditWalletNameScreen from './Settings/EditWalletNameScreen';
import ExportMnemonicsScreen from './Settings/ExportMnemonicsScreen';
import ExportPrivateKeyScreen from './Settings/ExportPrivateKeyScreen';
import NetworkTypeScreen from './Settings/NetworkTypeScreen';
import UpgradeNoticeScreen from './Settings/UpgradeNoticeScreen';
import ReceiveScreen from './Wallet/ReceiveScreen';
import TxConfirmScreen from './Wallet/TxConfirmScreen';
import TxFailScreen from './Wallet/TxFailScreen';
import TxOpnetConfirmScreen from './Wallet/TxOpnetConfirmScreen';
import TxSuccessScreen from './Wallet/TxSuccessScreen';
import UnavailableUtxoScreen from './Wallet/UnavailableUtxoScreen';
import './index.module.less';

export enum RouteTypes {
    BoostScreen = 'BoostScreen',
    WelcomeScreen = 'WelcomeScreen',
    MainScreen = 'MainScreen',
    AppTabScrren = 'AppTabScrren',
    SettingsTabScreen = 'SettingsTabScreen',
    CreateHDWalletScreen = 'CreateHDWalletScreen',
    CreateAccountScreen = 'CreateAccountScreen',
    CreatePasswordScreen = 'CreatePasswordScreen',
    UnlockScreen = 'UnlockScreen',
    SwitchAccountScreen = 'SwitchAccountScreen',
    ReceiveScreen = 'ReceiveScreen',
    TxConfirmScreen = 'TxConfirmScreen',
    TxOpnetConfirmScreen = 'TxOpnetConfirmScreen',
    TxSuccessScreen = 'TxSuccessScreen',
    TxFailScreen = 'TxFailScreen',
    NetworkTypeScreen = 'NetworkTypeScreen',
    ChangePasswordScreen = 'ChangePasswordScreen',
    ExportMnemonicsScreen = 'ExportMnemonicsScreen',
    ExportPrivateKeyScreen = 'ExportPrivateKeyScreen',
    AdvancedScreen = 'AdvancedScreen',
    ApprovalScreen = 'ApprovalScreen',
    ConnectedSitesScreen = 'ConnectedSitesScreen',
    SwitchKeyringScreen = 'SwitchKeyringScreen',
    AddKeyringScreen = 'AddKeyringScreen',
    EditWalletNameScreen = 'EditWalletNameScreen',
    CreateSimpleWalletScreen = 'CreateSimpleWalletScreen',
    CreateKeystoneWalletScreen = 'CreateKeystoneWalletScreen',
    UpgradeNoticeScreen = 'UpgradeNoticeScreen',
    AddressTypeScreen = 'AddressTypeScreen',
    EditAccountNameScreen = 'EditAccountNameScreen',
    UnavailableUtxoScreen = 'UnavailableUtxoScreen',
    OpNetTokenScreen = 'OpNetTokenScreen',
    SendOpNetScreen = 'SendOpNetScreen',
    TxCreateScreen = 'TxCreateScreen',
    Swap = 'Swap',
    DeployContract = 'DeployContract',
    Mint = 'Mint',
    Airdrop = 'Airdrop',
    SplitUtxoScreen = 'SplitUtxoScreen'
}

type Routes = {
    [key in RouteTypes]: {
        path: string;
        element: ReactElement;
    };
};

export const routes: Routes = {
    BoostScreen: {
        path: '/',
        element: <BoostScreen />
    },
    WelcomeScreen: {
        path: '/welcome',
        element: <WelcomeScreen />
    },
    MainScreen: {
        path: '/main',
        element: <WalletTabScreen />
    },
    AppTabScrren: {
        path: '/app',
        element: <AppTabScrren />
    },
    SettingsTabScreen: {
        path: '/settings',
        element: <SettingsTabScreen />
    },
    CreateHDWalletScreen: {
        path: '/account/create-hd-wallet',
        element: <CreateHDWalletScreen />
    },
    TxCreateScreen: {
        path: '/wallet/tx/create',
        element: <TxCreateScreen />
    },
    CreateAccountScreen: {
        path: '/account/create',
        element: <CreateAccountScreen />
    },
    CreatePasswordScreen: {
        path: '/account/create-password',
        element: <CreatePasswordScreen />
    },
    UnlockScreen: {
        path: '/account/unlock',
        element: <UnlockScreen />
    },
    SwitchAccountScreen: {
        path: '/account/switch-account',
        element: <SwitchAccountScreen />
    },
    ReceiveScreen: {
        path: '/wallet/receive',
        element: <ReceiveScreen />
    },
    TxConfirmScreen: {
        path: '/wallet/tx/confirm',
        element: <TxConfirmScreen />
    },
    TxOpnetConfirmScreen: {
        path: '/wallet/tx/confirm-opnet',
        element: <TxOpnetConfirmScreen />
    },
    TxSuccessScreen: {
        path: '/wallet/tx/success',
        element: <TxSuccessScreen />
    },
    TxFailScreen: {
        path: '/wallet/tx/fail',
        element: <TxFailScreen />
    },
    NetworkTypeScreen: {
        path: '/settings/network-type',
        element: <NetworkTypeScreen />
    },
    ChangePasswordScreen: {
        path: '/settings/password',
        element: <ChangePasswordScreen />
    },
    ExportMnemonicsScreen: {
        path: '/settings/export-mnemonics',
        element: <ExportMnemonicsScreen />
    },
    ExportPrivateKeyScreen: {
        path: '/settings/export-privatekey',
        element: <ExportPrivateKeyScreen />
    },
    AdvancedScreen: {
        path: '/settings/advanced',
        element: <AdvancedScreen />
    },
    ApprovalScreen: {
        path: '/approval',
        element: <ApprovalScreen />
    },
    ConnectedSitesScreen: {
        path: '/connected-sites',
        element: <ConnectedSitesScreen />
    },
    SwitchKeyringScreen: {
        path: '/account/switch-keyring',
        element: <SwitchKeyringScreen />
    },
    AddKeyringScreen: {
        path: '/account/add-keyring',
        element: <AddKeyringScreen />
    },
    EditWalletNameScreen: {
        path: '/settings/edit-wallet-name',
        element: <EditWalletNameScreen />
    },
    CreateSimpleWalletScreen: {
        path: '/account/create-simple-wallet',
        element: <CreateSimpleWalletScreen />
    },
    CreateKeystoneWalletScreen: {
        path: '/account/create-keystone-wallet',
        element: <CreateKeystoneWalletScreen />
    },
    UpgradeNoticeScreen: {
        path: '/settings/upgrade-notice',
        element: <UpgradeNoticeScreen />
    },
    AddressTypeScreen: {
        path: '/settings/address-type',
        element: <AddressTypeScreen />
    },
    EditAccountNameScreen: {
        path: '/settings/edit-account-name',
        element: <EditAccountNameScreen />
    },
    UnavailableUtxoScreen: {
        path: '/wallet/unavailable-utxo',
        element: <UnavailableUtxoScreen />
    },
    OpNetTokenScreen: {
        path: '/opnet/token',
        element: <OpNetTokenScreen />
    },
    SendOpNetScreen: {
        path: '/opnet/send-opnet',
        element: <SendOpNetScreen />
    },
    Swap: {
        path: '/opnet/swap',
        element: <Swap />
    },
    DeployContract: {
        path: '/opnet/deploy-contract',
        element: <DeployContract />
    },
    Mint: {
        path: '/opnet/mint',
        element: <Mint />
    },
    Airdrop: {
        path: '/opnet/airdrop',
        element: <Airdrop />
    },
    SplitUtxoScreen: {
        path: '/opnet/split-utxo',
        element: <SplitUtxoScreen />
    }
};

// TODO (typing): Check again but it looks like that we need to have a map between 
// RouteTypes and their data while calling navigate function 
export type UseNavigate<T extends RouteTypes> = (routKey: T, state?: unknown) => void;

export function useNavigate<T extends RouteTypes>(): UseNavigate<T> {
    const navigate = useNavigateOrigin();

    return useCallback(
        (routKey: T, state?: unknown) => {
            navigate(routes[routKey].path, { state });
        },
        [useNavigateOrigin]
    ) as UseNavigate<T>;
}

const Main = () => {
    const wallet = useWallet();
    const dispatch = useAppDispatch();

    const isReady = useIsReady();
    const isUnlocked = useIsUnlocked();

    const selfRef = useRef({
        settingsLoaded: false,
        summaryLoaded: false,
        accountLoaded: false,
        configLoaded: false
    });
    const self = selfRef.current;
    const init = useCallback(async () => {
        try {
            if (!self.accountLoaded) {
                const currentAccount = await wallet.getCurrentAccount();
                if (currentAccount) {
                    dispatch(accountActions.setCurrent(currentAccount));

                    const accounts = await wallet.getAccounts();
                    dispatch(accountActions.setAccounts(accounts));

                    if (accounts.length > 0) {
                        self.accountLoaded = true;
                    }
                }
            }

            if (!self.settingsLoaded) {
                const chainType = await wallet.getChainType();
                dispatch(
                    settingsActions.updateSettings({
                        chainType
                    })
                );

                const _locale = await wallet.getLocale();
                dispatch(settingsActions.updateSettings({ locale: _locale }));
                self.settingsLoaded = true;
            }

            if (!self.summaryLoaded) {
                const appSummary = await wallet.getAppSummary();
                dispatch(accountActions.setAppSummary(appSummary));

                self.summaryLoaded = true;
            }

            if (!self.configLoaded) {
                self.configLoaded = true;

                const v = await wallet.getSkippedVersion();
                dispatch(settingsActions.updateSettings({ skippedVersion: v }));

                const a = await wallet.getAutoLockTimeId();
                dispatch(settingsActions.updateSettings({ autoLockTimeId: a }));
            }

            dispatch(globalActions.update({ isReady: true }));
        } catch (e) {
            console.log('init error', e);
        }
    }, [wallet, dispatch, isReady, isUnlocked]);

    useEffect(() => {
        void (async () => {
            const val = await wallet.hasVault();

            if (val) {
                dispatch(globalActions.update({ isBooted: true }));

                const isUnlock = await wallet.isUnlocked();
                dispatch(globalActions.update({ isUnlocked: isUnlock }));
            }
        })();
    }, []);

    useEffect(() => {
        void init();
    }, [init]);

    if (!isReady) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100vw',
                    height: '100vh',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                <Content justifyCenter itemsCenter>
                    <Icon>
                        <LoadingOutlined />
                    </Icon>
                </Content>
            </div>
        );
    }

    return (
        <HashRouter>
            <Routes>
                {Object.entries(routes).map(([_, value]) => (
                    <Route key={value.path} path={value.path} element={value.element} />
                ))}
            </Routes>
        </HashRouter>
    );
};

export default Main;
