import { useCallback } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useNavigate as useNavigateOrigin } from 'react-router-dom';

import AddAccountScreen from './Account/AddAccountScreen';
import CreateAccountScreen from './Account/CreateAccountScreen';
import CreateMnemonicsScreen from './Account/CreateMnemonicsScreen';
import CreatePasswordScreen from './Account/CreatePasswordScreen';
import ImportAccountScreen from './Account/ImportAccountScreen';
import ImportMnemonicsScreen from './Account/ImportMnemonicsScreen';
import SwitchAccountScreen from './Account/SwitchAccountScreen';
import SwitchAddressScreen from './Account/SwitchAddressScreen';
import UnlockScreen from './Account/UnlockScreen';
import BoostScreen from './Main/BoostScreen';
import MainScreen from './Main/TabScreen';
import WelcomeScreen from './Main/WelcomeScreen';
import AddressTypeScreen from './Settings/AddressTypeScreen';
import ChangeLanguageScreen from './Settings/ChangeLanguageScreen';
import ChangePasswordScreen from './Settings/ChangePasswordScreen';
import ExportMnemonicsScreen from './Settings/ExportMnemonicsScreen';
import ExportPrivateKeyScreen from './Settings/ExportPrivateKeyScreen';
import NetworkTypeScreen from './Settings/NetworkTypeScreen';
import RemoveAccount from './Settings/RemoveAccountScreen';
import HistoryScreen from './Wallet/HistoryScreen';
import OrdinalsDetailScreen from './Wallet/OrdinalsDetailScreen';
import OrdinalsTxConfirmScreen from './Wallet/OrdinalsTxConfirmScreen';
import OrdinalsTxCreateScreen from './Wallet/OrdinalsTxCreateScreen';
import ReceiveScreen from './Wallet/ReceiveScreen';
import TxConfirmScreen from './Wallet/TxConfirmScreen';
import TxCreateScreen from './Wallet/TxCreateScreen';
import TxFailScreen from './Wallet/TxFailScreen';
import TxSuccessScreen from './Wallet/TxSuccessScreen';
import './index.module.less';

const routes = {
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
    element: <MainScreen />
  },
  CreateMnemonicsScreen: {
    path: '/account/create-mnemonics',
    element: <CreateMnemonicsScreen />
  },
  ImportMnemonicsScreen: {
    path: '/account/import-mnemonics',
    element: <ImportMnemonicsScreen />
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
  SwitchAddressScreen: {
    path: '/account/switch-address',
    element: <SwitchAddressScreen />
  },
  AddAccountScreen: {
    path: '/account/add',
    element: <AddAccountScreen />
  },
  ImportAccountScreen: {
    path: '/account/import',
    element: <ImportAccountScreen />
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

  OrdinalsDetailScreen: {
    path: '/wallet/ordinals-detail',
    element: <OrdinalsDetailScreen />
  },

  OrdinalsTxCreateScreen: {
    path: '/wallet/ordinals-tx/create',
    element: <OrdinalsTxCreateScreen />
  },

  OrdinalsTxConfirmScreen: {
    path: '/wallet/ordinals-tx/confirm',
    element: <OrdinalsTxConfirmScreen />
  },

  AddressTypeScreen: {
    path: '/settings/address-type',
    element: <AddressTypeScreen />
  },
  NetworkTypeScreen: {
    path: '/settings/network-type',
    element: <NetworkTypeScreen />
  },
  ChangeLanguageScreen: {
    path: '/settings/language',
    element: <ChangeLanguageScreen />
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
  RemoveAccount: {
    path: '/settings/remove-account',
    element: <RemoveAccount />
  },
  HistoryScreen: {
    path: '/wallet/history',
    element: <HistoryScreen />
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
