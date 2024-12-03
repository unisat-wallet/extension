import { useCallback, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useNavigate as useNavigateOrigin } from 'react-router-dom';

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
import { InscribeTransferScreen } from './Approval/components/InscribeTransfer';
import AtomicalsNFTScreen from './Atomicals/AtomicalsNFTScreen';
import SendArc20Screen from './Atomicals/SendArc20Screen';
import SendAtomicalsInscriptionScreen from './Atomicals/SendAtomicalsNFTScreen';
import BRC20SendScreen from './BRC20/BRC20SendScreen';
import BRC20TokenScreen from './BRC20/BRC20TokenScreen';
import CAT20TokenScreen from './CAT20/CAT20TokenScreen';
import MergeCAT20HistoryScreen from './CAT20/MergeCAT20HistoryScreen';
import MergeCAT20Screen from './CAT20/MergeCAT20Screen';
import SendCAT20Screen from './CAT20/SendCAT20Screen';
import AppTabScrren from './Main/AppTabScreen';
import BoostScreen from './Main/BoostScreen';
import DiscoverTabScreen from './Main/DiscoverTabScreen';
import SettingsTabScreen from './Main/SettingsTabScreen';
import WalletTabScreen from './Main/WalletTabScreen';
import WelcomeScreen from './Main/WelcomeScreen';
import OrdinalsInscriptionScreen from './Ordinals/OrdinalsInscriptionScreen';
import SendOrdinalsInscriptionScreen from './Ordinals/SendOrdinalsInscriptionScreen';
import SignOrdinalsTransactionScreen from './Ordinals/SignOrdinalsTransactionScreen';
import SplitOrdinalsInscriptionScreen from './Ordinals/SplitOrdinalsInscriptionScreen';
import RunesTokenScreen from './Runes/RunesTokenScreen';
import SendRunesScreen from './Runes/SendRunesScreen';
import AddressTypeScreen from './Settings/AddressTypeScreen';
import AdvancedScreen from './Settings/AdvancedScreen';
import ChangePasswordScreen from './Settings/ChangePasswordScreen';
import EditAccountNameScreen from './Settings/EditAccountNameScreen';
import EditWalletNameScreen from './Settings/EditWalletNameScreen';
import ExportMnemonicsScreen from './Settings/ExportMnemonicsScreen';
import ExportPrivateKeyScreen from './Settings/ExportPrivateKeyScreen';
import NetworkTypeScreen from './Settings/NetworkTypeScreen';
import UpgradeNoticeScreen from './Settings/UpgradeNoticeScreen';
import TestScreen from './Test/TestScreen';
import HistoryScreen from './Wallet/HistoryScreen';
import ReceiveScreen from './Wallet/ReceiveScreen';
import TxConfirmScreen from './Wallet/TxConfirmScreen';
import TxCreateScreen from './Wallet/TxCreateScreen';
import TxFailScreen from './Wallet/TxFailScreen';
import TxSuccessScreen from './Wallet/TxSuccessScreen';
import UnavailableUtxoScreen from './Wallet/UnavailableUtxoScreen';
import './index.module.less';

export const routes = {
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
  DiscoverTabScreen: {
    path: '/discover',
    element: <DiscoverTabScreen />
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

  TxCreateScreen: {
    path: '/wallet/tx/create',
    element: <TxCreateScreen />
  },
  TxConfirmScreen: {
    path: '/wallet/tx/confirm',
    element: <TxConfirmScreen />
  },
  TxSuccessScreen: {
    path: '/wallet/tx/success',
    element: <TxSuccessScreen />
  },
  TxFailScreen: {
    path: '/wallet/tx/fail',
    element: <TxFailScreen />
  },

  OrdinalsInscriptionScreen: {
    path: '/ordinals/inscription-detail',
    element: <OrdinalsInscriptionScreen />
  },

  SendOrdinalsInscriptionScreen: {
    path: '/wallet/ordinals-tx/create',
    element: <SendOrdinalsInscriptionScreen />
  },

  SignOrdinalsTransactionScreen: {
    path: '/wallet/ordinals-tx/confirm',
    element: <SignOrdinalsTransactionScreen />
  },

  AtomicalsInscriptionScreen: {
    path: '/atomicals/inscription-detail',
    element: <AtomicalsNFTScreen />
  },

  SendAtomicalsInscriptionScreen: {
    path: '/atomicals/send-inscription',
    element: <SendAtomicalsInscriptionScreen />
  },

  SendArc20Screen: {
    path: '/atomicals/send-arc20',
    element: <SendArc20Screen />
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
  HistoryScreen: {
    path: '/wallet/history',
    element: <HistoryScreen />
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
  InscribeTransferScreen: {
    path: '/inscribe/transfer',
    element: <InscribeTransferScreen />
  },
  BRC20SendScreen: {
    path: '/brc20/send',
    element: <BRC20SendScreen />
  },
  BRC20TokenScreen: {
    path: '/brc20/token',
    element: <BRC20TokenScreen />
  },
  TestScreen: {
    path: '/test',
    element: <TestScreen />
  },
  SplitOrdinalsInscriptionScreen: {
    path: '/wallet/split-tx/create',
    element: <SplitOrdinalsInscriptionScreen />
  },
  UnavailableUtxoScreen: {
    path: '/wallet/unavailable-utxo',
    element: <UnavailableUtxoScreen />
  },

  SendRunesScreen: {
    path: '/runes/send-runes',
    element: <SendRunesScreen />
  },
  RunesTokenScreen: {
    path: '/runes/token',
    element: <RunesTokenScreen />
  },

  CAT20TokenScreen: {
    path: '/cat20/token',
    element: <CAT20TokenScreen />
  },
  SendCAT20Screen: {
    path: '/cat20/send-cat20',
    element: <SendCAT20Screen />
  },
  MergeCAT20Screen: {
    path: '/cat20/merge-cat20',
    element: <MergeCAT20Screen />
  },
  MergeCAT20HistoryScreen: {
    path: '/cat20/merge-history',
    element: <MergeCAT20HistoryScreen />
  }
};

type RouteTypes = keyof typeof routes;

export function useNavigate() {
  const navigate = useNavigateOrigin();
  return useCallback(
    (routKey: RouteTypes, state?: any) => {
      navigate(routes[routKey].path, { state });
    },
    [useNavigateOrigin]
  );
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
        // wallet.getInscriptionSummary().then((data) => {
        //   dispatch(accountActions.setInscriptionSummary(data));
        // });

        // wallet.getAppSummary().then((data) => {
        //   dispatch(accountActions.setAppSummary(data));
        // });

        // wallet.getBannerList().then((data) => {
        //   dispatch(accountActions.setBannerList(data));
        // });

        // wallet.getAppList().then((data) => {
        //   dispatch(accountActions.setAppList(data));
        // });
        self.summaryLoaded = true;
      }

      if (!self.configLoaded) {
        self.configLoaded = true;

        // already load when reloadAccounts
        // wallet.getWalletConfig().then((data) => {
        //   dispatch(settingsActions.updateSettings({ walletConfig: data }));
        // });
        wallet.getSkippedVersion().then((data) => {
          dispatch(settingsActions.updateSettings({ skippedVersion: data }));
        });

        wallet.getAutoLockTimeId().then((data) => {
          dispatch(settingsActions.updateSettings({ autoLockTimeId: data }));
        });
      }

      dispatch(globalActions.update({ isReady: true }));
    } catch (e) {
      console.log('init error', e);
    }
  }, [wallet, dispatch, isReady, isUnlocked]);

  useEffect(() => {
    wallet.hasVault().then((val) => {
      if (val) {
        dispatch(globalActions.update({ isBooted: true }));
        wallet.isUnlocked().then((isUnlocked) => {
          dispatch(globalActions.update({ isUnlocked }));
        });
      }
    });
  }, []);

  useEffect(() => {
    init();
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
        {Object.keys(routes)
          .map((v) => routes[v])
          .map((v) => (
            <Route key={v.path} path={v.path} element={v.element} />
          ))}
      </Routes>
    </HashRouter>
  );
};

export default Main;
