import { isHDKeyring, isKeystoneKeyring } from '@/background/utils/keyring';
import KeyringService, { Keyring } from './index';

class DisplayKeyring {
    accounts: string[] = [];
    type = '';
    hdPath = '';

    constructor(keyring: Keyring) {
        if (isHDKeyring(keyring) || isKeystoneKeyring(keyring)){
            this.hdPath = keyring.hdPath || '';
        }
        this.accounts = keyring.getAccounts();
        this.type = keyring.type;
    }

    // TODO (typing): If it's not planning to implement unlock function in any of the Keyring types in the future,
    // we can remove this function completely as none of the Keyring implementations require it (checked wallet-sdk).
    // unlock = async (): Promise<void> => {
    //     const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    //     if (keyring.unlock) await keyring.unlock();
    // };

    getFirstPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        if (isHDKeyring(keyring) || isKeystoneKeyring(keyring)){
            return await keyring.getFirstPage();
        } else {
            return [];
        }
    };

    getNextPage = async () => {
        const keyring = KeyringService.getKeyringForAccount(this.accounts[0], this.type);
        if (isHDKeyring(keyring) || isKeystoneKeyring(keyring)){
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
        if (isHDKeyring(keyring) || isKeystoneKeyring(keyring)){
            return keyring.activeAccounts(indexes);
        } else {
            return [];
        }
    };
}

export default DisplayKeyring;
