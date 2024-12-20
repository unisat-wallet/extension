import { Account, AddressSummary, AppSummary, TxHistoryItem } from '@/shared/types';
import { createSlice } from '@reduxjs/toolkit';

import { updateVersion } from '../global/actions';

export interface AccountsState {
    accounts: Account[];
    current: Account;
    loading: boolean;
    balanceMap: Record<
        string,
        {
            amount: string;
            btc_amount: string;
            confirm_btc_amount: string;
            pending_btc_amount: string;
            inscription_amount: string;
            expired: boolean;
        }
    >;
    historyMap: Record<
        string,
        {
            list: TxHistoryItem[];
            expired: boolean;
        }
    >;
    inscriptionsMap: Record<
        string,
        {
            expired: boolean;
        }
    >;
    appSummary: AppSummary;
    addressSummary: AddressSummary;
}

const initialAccount = {
    type: '',
    address: '',
    brandName: '',
    alianName: '',
    displayBrandName: '',
    index: 0,
    balance: 0,
    pubkey: '',
    key: '',
    flag: 0
};

export const initialState: AccountsState = {
    accounts: [],
    current: initialAccount,
    loading: false,
    balanceMap: {},
    historyMap: {},
    inscriptionsMap: {},
    appSummary: {
        apps: []
    },
    addressSummary: {
        address: '',
        totalSatoshis: 0,
        loading: true
    }
};

const slice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        pendingLogin(state) {
            state.loading = true;
        },
        setCurrent(state, action: { payload: Account }) {
            const { payload } = action;
            state.current = payload || initialAccount;
        },
        setAccounts(state, action: { payload: Account[] }) {
            const { payload } = action;
            state.accounts = payload;
        },
        setBalance(
            state,
            action: {
                payload: {
                    address: string;
                    amount: string;
                    btc_amount: string;
                    inscription_amount: string;
                    confirm_btc_amount: string;
                    pending_btc_amount: string;
                };
            }
        ) {
            const {
                payload: { address, amount, btc_amount, inscription_amount, confirm_btc_amount, pending_btc_amount }
            } = action;
            state.balanceMap[address] = state.balanceMap[address] || {
                amount: '0',
                btc_amount: '0',
                inscription_amount: '0',
                confirm_btc_amount: '0',
                pending_btc_amount: '0',
                expired: true
            };
            state.balanceMap[address].amount = amount;
            state.balanceMap[address].btc_amount = btc_amount;
            state.balanceMap[address].inscription_amount = inscription_amount;
            state.balanceMap[address].confirm_btc_amount = confirm_btc_amount;
            state.balanceMap[address].pending_btc_amount = pending_btc_amount;
            state.balanceMap[address].expired = false;
        },
        setAddressSummary(state, action: { payload: AddressSummary }) {
            state.addressSummary = action.payload;
        },
        expireBalance(state) {
            const balance = state.balanceMap[state.current.address];
            if (balance) {
                balance.expired = true;
            }
        },
        setHistory(state, action: { payload: { address: string; list: TxHistoryItem[] } }) {
            const {
                payload: { address, list }
            } = action;
            state.historyMap[address] = state.historyMap[address] || {
                list: [],
                expired: true
            };
            state.historyMap[address].list = list;
            state.historyMap[address].expired = false;
        },
        expireHistory(state) {
            const history = state.historyMap[state.current.address];
            if (history) {
                history.expired = true;
            }
        },
        setInscriptions(state, action: { payload: { address: string } }) {
            const {
                payload: { address }
            } = action;
            state.inscriptionsMap[address] = state.inscriptionsMap[address] || {
                list: [],
                expired: true
            };
            state.inscriptionsMap[address].expired = false;
        },
        expireInscriptions(state) {
            const inscriptions = state.inscriptionsMap[state.current.address];
            if (inscriptions) {
                inscriptions.expired = true;
            }
        },
        setCurrentAccountName(state, action: { payload: string }) {
            const { payload } = action;
            state.current.alianName = payload;
            const account = state.accounts.find((v) => v.address === state.current.address);
            if (account) {
                account.alianName = payload;
            }
        },
        setCurrentAddressFlag(state, action: { payload: number }) {
            const { payload } = action;
            state.current.flag = payload;
            const account = state.accounts.find((v) => v.address === state.current.address);
            if (account) {
                account.flag = payload;
            }
        },
        setAppSummary(state, action: { payload: AppSummary }) {
            const { payload } = action;
            state.appSummary = payload;
        },
        rejectLogin(state) {
            state.loading = false;
        },
        reset(state) {
            return initialState;
        },
        updateAccountName(
            state,
            action: {
                payload: Account;
            }
        ) {
            const account = action.payload;
            if (state.current.key === account.key) {
                state.current.alianName = account.alianName;
            }
            state.accounts.forEach((v) => {
                if (v.key === account.key) {
                    v.alianName = account.alianName;
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder.addCase(updateVersion, (state) => {
            // todo
            if (!state.addressSummary) {
                state.addressSummary = {
                    totalSatoshis: 0,
                    address: ''
                };
            }
        });
    }
});

export const accountActions = slice.actions;
export default slice.reducer;
