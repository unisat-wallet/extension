import { ChainType } from "../constant";

export interface ProviderState {
    network: string;
    chain: ChainType;
    isUnlocked: boolean;
    accounts: string[];
}