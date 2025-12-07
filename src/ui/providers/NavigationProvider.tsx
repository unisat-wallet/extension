import { NavigationContext, NavigationContextType, useChain } from '@unisat/wallet-state';
import { ChainType } from '@unisat/wallet-types';
import { useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate as useNavigateOrigin } from 'react-router-dom';
import { routes, RouteTypes } from '../pages/MainRoute';

export function useNavigate() {
  const navigate = useNavigateOrigin();
  const navigatingRef = useRef(false);

  return useCallback(
    (routKey: RouteTypes | '#back', state?: any, pathState?: any) => {
      if (navigatingRef.current) {
        return;
      }

      navigatingRef.current = true;

      if (routKey.startsWith('/')) {
        navigate(routKey, { state });
        navigatingRef.current = false;
        return;
      }

      if (routKey === '#back') {
        window.history.back();
        navigatingRef.current = false;
        return;
      }

      if (!routes[routKey]) {
        navigatingRef.current = false;
        return;
      }

      const route: any = routes[routKey];
      if (route.getDynamicPath) {
        const path = route.getDynamicPath(pathState);
        navigate(path, { replace: false, state });
        navigatingRef.current = false;
        return;
      }

      navigate(
        {
          pathname: route.path
        },
        { replace: false, state }
      );

      navigatingRef.current = false;
    },
    [navigate]
  );
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const chain = useChain();
  const value = useMemo<NavigationContextType>(
    () => ({
      navigate: (screenName: RouteTypes, state?: any, pathState?: any) => {
        navigate(screenName, state, pathState);
      },
      poptotop() {
        //   navigation.dispatch(StackActions.popToTop())
      },
      goBack: () => {
        window.history.go(-1);
      },
      replace: (screenName: RouteTypes, params?: any) => {
        // todo
      },
      navToTab: () => {
        navigate('MainScreen');
      },
      navToLock: (params?: any) => {
        // todo
      },
      navToWelcome: () => {
        // todo
      },
      getRouteState<T>(): T {
        const { state } = useLocation();
        return (state || {}) as T;
      },

      navToUtxoTools: () => {
        window.open(`${chain.unisatUrl}/utxo?tab=all`);
      },

      navToUrl: (url: string) => {
        window.open(url);
      },

      navToExplorerTx: (txid: string) => {
        let url = '';
        if (chain.enum === ChainType.BITCOIN_MAINNET) {
          url = `${chain.unisatExplorerUrl}/tx/${txid}`;
        } else if (chain.defaultExplorer === 'mempool-space') {
          url = `${chain.mempoolSpaceUrl}/tx/${txid}`;
        } else {
          url = `${chain.unisatExplorerUrl}/tx/${txid}`;
        }
        window.open(url);
      },

      navToExplorerAddress: (address: string) => {
        if (chain.isViewTxHistoryInternally) {
          navigate('HistoryScreen');
          return;
        }
        let url = '';
        if (chain.enum === ChainType.BITCOIN_MAINNET) {
          url = `${chain.unisatExplorerUrl}/address/${address}`;
        } else if (chain.defaultExplorer === 'mempool-space') {
          url = `${chain.mempoolSpaceUrl}/address/${address}`;
        } else {
          url = `${chain.unisatExplorerUrl}/address/${address}`;
        }
        window.open(url);
      },

      navToMarketPlaceBrc20(ticker: string) {
        let url = '';
        if (chain.enum === ChainType.BITCOIN_MAINNET) {
          if (ticker.length == 6) {
            url = `${chain.unisatUrl}/market/brc20_prog?tick=${encodeURIComponent(ticker)}`;
            window.open(url);
            return;
          }
        }
        url = `${chain.unisatUrl}/market/brc20?tick=${encodeURIComponent(ticker)}`;
        window.open(url);
      },

      navToInscribeBrc20(ticker: string) {
        let isBrc20Prog = false;
        if (chain.enum === ChainType.BITCOIN_MAINNET || chain.enum === ChainType.BITCOIN_SIGNET) {
          if (ticker.length == 6) {
            isBrc20Prog = true;
          }
        }

        let url = '';

        if (isBrc20Prog) {
          url = `${chain.unisatUrl}/inscribe?tab=brc20-prog&tick=${encodeURIComponent(ticker)}`;
        } else {
          url = `${chain.unisatUrl}/inscribe?tick=${encodeURIComponent(ticker)}`;
        }
        window.open(url);
      }
    }),
    [navigate, chain]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
