import KeyringService, { Keyring } from './index';

class DisplayKeyring {
    accounts: string[] = [];
    type = '';
    hdPath = '';

    constructor(keyring: Keyring) {
        // @ts-ignore
        this.accounts = keyring.accounts || [];
        this.type = keyring.type;
        this.hdPath = (keyring as any).hdPath;
    }

    unlock = async (): Promise<void> => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-ignore
        if (keyring.unlock) await keyring.unlock();
    };

    getFirstPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-ignore
        if (keyring.getFirstPage) {
            // @ts-ignore
            return await keyring.getFirstPage();
        } else {
            return [];
        }
    };

    getNextPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        // @ts-ignore
        if (keyring.getNextPage) {
            // @ts-ignore
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
        // @ts-ignore
        if (keyring.activeAccounts) {
            // @ts-ignore
            return keyring.activeAccounts(indexes);
        } else {
            return [];
        }
    };
}

export default DisplayKeyring;
