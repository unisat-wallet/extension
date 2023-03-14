import KeyringService, { Keyring } from './index';

class DisplayKeyring {
  accounts: string[] = [];
  type = '';
  hdPath = '';

  constructor(keyring: Keyring) {
    this.accounts = keyring.accounts || [];
    this.type = keyring.type;
    this.hdPath = (keyring as any).hdPath;
  }

  unlock = async (): Promise<void> => {
    const keyring = await KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    if (keyring.unlock) await keyring.unlock();
  };

  getFirstPage = async () => {
    const keyring = await KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    if (keyring.getFirstPage) {
      return await keyring.getFirstPage();
    } else {
      return [];
    }
  };

  getNextPage = async () => {
    const keyring = await KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    if (keyring.getNextPage) {
      return await keyring.getNextPage();
    } else {
      return [];
    }
  };

  getAccounts = async () => {
    const keyring = await KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    return await keyring.getAccounts();
  };

  activeAccounts = async (indexes: number[]): Promise<string[]> => {
    const keyring = await KeyringService.getKeyringForAccount(this.accounts[0], this.type);
    if (keyring.activeAccounts) {
      return keyring.activeAccounts(indexes);
    } else {
      return [];
    }
  };
}

export default DisplayKeyring;
