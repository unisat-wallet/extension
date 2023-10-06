import { detectAddressTypeToScripthash } from './utils';
import { ElectrumApiInterface, IAtomicalBalanceSummary, IAtomicalBalances, ISelectedUtxo } from './interfaces/api';

export class AtomicalService {
  constructor(public electrumApi: ElectrumApiInterface) {}

  private async ensureService() {
    await this.electrumApi.resetConnection();
  }

  async open() {
    try {
      return await this.electrumApi.open();
    } catch (error) {
      throw 'socket open error';
    }
  }

  async close() {
    await this.electrumApi.close();
  }

  public reset() {
    this.electrumApi.reset();
  }

  async walletInfo(
    address: string,
    verbose: boolean
  ): Promise<{
    success: boolean;
    data: {
      address: string;
      scripthash: string;
      atomicals_count: number;
      atomicals_utxos: ISelectedUtxo[];
      atomicals_balances: IAtomicalBalances;
      total_confirmed: number;
      total_unconfirmed: number;
      atomicals_confirmed: number;
      atomicals_unconfirmed: number;
      regular_confirmed: number;
      regular_unconfirmed: number;
      regular_utxos: ISelectedUtxo[];
      regular_utxo_count: number;
      history: any;
    };
  }> {
    try {
      // await this.open();
      const { scripthash } = detectAddressTypeToScripthash(address);
      const res = await this.electrumApi.atomicalsByScripthash(scripthash, true);
      let history = undefined;
      if (verbose) {
        history = await this.electrumApi.history(scripthash);
      }
      const plainUtxos: any[] = [];
      let total_confirmed = 0;
      let total_unconfirmed = 0;
      let regular_confirmed = 0;
      let regular_unconfirmed = 0;
      let atomicals_confirmed = 0;
      let atomicals_unconfirmed = 0;
      const atomicalsUtxos: any[] = [];

      for (const utxo of res.utxos) {
        if (utxo.height <= 0) {
          total_unconfirmed += utxo.value;
        } else {
          total_confirmed += utxo.value;
        }

        if (utxo.atomicals && utxo.atomicals.length) {
          if (utxo.height <= 0) {
            atomicals_unconfirmed += utxo.value;
          } else {
            atomicals_confirmed += utxo.value;
          }
          atomicalsUtxos.push(utxo);
          continue;
        }

        if (utxo.height <= 0) {
          regular_unconfirmed += utxo.value;
        } else {
          regular_confirmed += utxo.value;
        }

        plainUtxos.push(utxo);
      }

      return {
        success: true,
        data: {
          address: address,
          scripthash: scripthash,
          atomicals_count: Object.keys(res.atomicals).length,
          atomicals_utxos: atomicalsUtxos as ISelectedUtxo[],
          atomicals_balances: res.atomicals as IAtomicalBalances,
          total_confirmed,
          total_unconfirmed,
          atomicals_confirmed,
          atomicals_unconfirmed,
          regular_confirmed,
          regular_unconfirmed,
          regular_utxos: plainUtxos,
          regular_utxo_count: plainUtxos.length,
          history
        }
      };
    } catch (error) {
      throw new Error('Connection Error, retrying...');
    }
  }

  async getBalanceSummary(atomicalId: string, address: string): Promise<IAtomicalBalanceSummary> {
    const res = await this.electrumApi.atomicalsByAddress(address);
    if (!res.atomicals[atomicalId]) {
      throw 'No Atomicals found for ' + atomicalId;
    }
    // console.log(JSON.stringify(res.atomicals[atomicalId], null, 2))
    // console.log(JSON.stringify(res.utxos, null, 2))
    const filteredUtxosByAtomical: any = [];
    for (const utxo of res.utxos) {
      if (utxo.atomicals.find((item: any) => item === atomicalId)) {
        filteredUtxosByAtomical.push({
          txid: utxo.txid,
          index: utxo.index,
          value: utxo.value,
          height: utxo.height,
          atomicals: utxo.atomicals
        });
      }
    }
    return {
      confirmed: res.atomicals[atomicalId].confirmed,
      type: res.atomicals[atomicalId].type,
      utxos: filteredUtxosByAtomical
    };
  }
}
