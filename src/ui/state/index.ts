import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import accounts from './accounts/reducer';
import { updateVersion } from './global/actions';
import global from './global/reducer';
import keyrings from './keyrings/reducer';
import settings from './settings/reducer';
import transactions from './transactions/reducer';

const store = configureStore({
  reducer: {
    accounts,
    transactions,
    settings,
    global,
    keyrings
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true })
});

store.dispatch(updateVersion());

setupListeners(store.dispatch);

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
