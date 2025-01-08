import { ContractLogo } from '@/shared/web3/metadata/ContractLogo';

export class ContractLogoManager {
    private cachedLogos: Record<string, Promise<string>> = {};

    public async getContractLogo(address: string): Promise<string> {
        if (!this.cachedLogos[address]) {
            this.cachedLogos[address] = this.internalGetContractLogo(address);
        }

        return this.cachedLogos[address];
    }

    private async internalGetContractLogo(address: string): Promise<string> {
        if (ContractLogo[address]) {
            return ContractLogo[address];
        }

        try {
            const contentInfo = await fetch(
                `https://raw.githubusercontent.com/btc-vision/contract-logo/main/contracts/${address}.png` // `https://api.github.com/repos/btc-vision/contract-logo/contents/contracts/${address}.png`
            );

            if (contentInfo.status !== 200) {
                throw new Error('Not found');
            }

            return `https://raw.githubusercontent.com/btc-vision/contract-logo/main/contracts/${address}.png`;
        } catch {
            return 'https://raw.githubusercontent.com/Cryptofonts/cryptoicons/master/128/btc.png';
        }
    }
}

export const contractLogoManager = new ContractLogoManager();
