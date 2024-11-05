import KeyringService, { Keyring } from './index';

class DisplayKeyring {
    accounts: string[] = [];
    type = '';
    hdPath = '';

    // TODO (typing): Check if it's possible to add the fields indicated with @ts-ignore into the Keyring in wallet-sdk.
    constructor(keyring: Keyring) {
        // @ts-expect-error
        this.accounts = keyring.accounts || [];
        this.type = keyring.type;
        // @ts-expect-error
        this.hdPath = (keyring).hdPath;
    }

    unlock = async (): Promise<void> => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-expect-error
        if (keyring.unlock) await keyring.unlock();
    };

    getFirstPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-expect-error
        if (keyring.getFirstPage) {
            // @ts-expect-error
            return await keyring.getFirstPage();
        } else {
            return [];
        }
    };

    getNextPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-expect-error
        if (keyring.getNextPage) {
            // @ts-expect-error
            return await keyring.getNextPage();
        } else {
            return [];
        }
    };

    getAccounts = () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        return keyring.getAccounts();
    };

    activeAccounts = (indexes: number[]): string[] => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-expect-error
        if (keyring.activeAccounts) {
            // @ts-expect-error
            return keyring.activeAccounts(indexes);
        } else {
            return [];
        }
    };
}

export default DisplayKeyring;
