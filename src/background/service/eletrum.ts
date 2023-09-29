import { ElectrumApiInterface, IUnspentResponse } from './interfaces/api';
import { detectAddressTypeToScripthash } from './utils';
import { UTXO } from './interfaces/utxo';
import * as rpcws from 'rpc-websockets';
import { WSProvider } from './providers/ws';
import { HttpProvider } from './providers/http';
import { isWs } from './providers/utils';
import { JsonRpc } from './providers/rpcMethod/builder';
import { SocketConnection } from './providers/baseSocket';
import { ResponseMiddleware, onResponse } from './providers/responseMiddleware';
let window = self;
const WebSocket = rpcws.Client;

export interface IWSRequestParams {
  [x: string]: any;
  [x: number]: any;
}

export class ElectrumApi implements ElectrumApiInterface {
  private ws?: rpcws.Client;
  private provider?: WSProvider | HttpProvider;
  private isOpenFlag = false;
  private JsonRpc?: JsonRpc;
  private socketConnected: boolean | undefined;

  private constructor(private url: string) {
    // this._connect();
    this._init();
  }
  public getUrl(): string {
    return this.url;
  }
  private _promise: Promise<boolean> | undefined;

  _init() {
    this.provider = isWs(this.url) ? new WSProvider(this.url) : new HttpProvider(this.url);
    this.JsonRpc = new JsonRpc();
    this._ws_watch();
  }

  _ws_watch() {
    if (this.provider instanceof WSProvider) {
      this.provider.on(SocketConnection.READY, (data: any) => {
        this.socketConnected = true;
      });
      this.provider.on(SocketConnection.ERROR, (data: any) => {
        this.socketConnected = false;
      });
    }
  }

  _send = async (method: string, params?: string | any[] | undefined) => {
    let rpcMethod = method;
    const payload = this.JsonRpc?.toPayload(rpcMethod, params);
    try {
      this.setResMiddleware(
        (data: any) => {
          if (!(data instanceof ResponseMiddleware)) {
            return new ResponseMiddleware(data);
          } else {
            return data;
          }
        },
        '*',
        this.provider!
      );
      console.log(payload);

      const result = await this.provider!.send(payload!);
      // return result;
      if ((result as ResponseMiddleware).isError()) {
        throw (result as ResponseMiddleware).getError;
      } else {
        return onResponse(result as ResponseMiddleware);
      }
      // getResultForData(result)
    } catch (e) {
      throw e;
    }
  };

  async isConnected(): Promise<boolean> {
    return (
      (this.provider instanceof WSProvider && this.socketConnected) ||
      (this.provider instanceof HttpProvider && (await this.serverVersion()))
    );
  }

  setResMiddleware(middleware: any, method = '*', provider: HttpProvider | WSProvider) {
    provider.middlewares.response.use(middleware, method);
  }

  // _connect() {
  //   try {
  //     this.ws = new WebSocket(this.url);
  //     this.ws.connect();
  //     this.ws.on('open', event => {
  //       this.isOpenFlag = true;
  //       console.log('opened');
  //     });
  //     this.ws.on('error', event => {
  //       this.isOpenFlag = false;
  //       console.log('error');
  //     });
  //   } catch (error) {
  //     console.log({ error });
  //     this.ws = undefined;
  //     this._connect();
  //   }
  // }

  resetConnection(): Promise<boolean> {
    if (this._promise) {
      return this._promise;
    }
    this._promise = new Promise<boolean>((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      let called = false;
      this.ws.on('open', (e) => {
        console.log('open', e);
        if (!called) {
          resolve(true);
        }
        this.isOpenFlag = true;
        called = true;
      });
      this.ws.addListener('error', (e) => {
        console.log('error', e);
        if (!called) {
          reject(e);
        }
        this.isOpenFlag = false;
        this._promise = undefined;
        called = true;
      });
      this.ws.addListener('close', (e) => {
        console.log('close', e);
        if (!called) {
          reject(e);
        }
        this.isOpenFlag = false;
        this._promise = undefined;
        called = true;
      });
    });
    return this._promise;
  }

  static createClient(url: string) {
    return new ElectrumApi(url);
  }

  public async open(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isOpenFlag) {
        resolve(true);
      }
      this.ws?.on('open', (event) => {
        this.isOpenFlag = true;
        resolve(true);
      });
      this.ws?.on('error', (event) => {
        this.isOpenFlag = false;
        console.log('error');
        // this.ws?.connect();
        reject(false);
      });
    });
  }

  public isOpen(): boolean {
    return this.isOpenFlag;
  }

  public async close(): Promise<any> {
    const p = new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.close();
      }
      this.isOpenFlag = false;
      resolve(true);
    });
    return p;
  }

  public async sendTransaction(signedRawtx: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.transaction.broadcast', [signedRawtx])
        .then(function (result: any) {
          console.log('result', result);
          resolve(result);
        })
        .catch((error) => {
          console.log('error', error);
          reject(error);
        });
    });
    return p;
  }

  public async getTx(txid: string, verbose = false): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.transaction.get', [txid, verbose ? 1 : 0])
        .then(function (result: any) {
          resolve({
            success: true,
            tx: result
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
    return p;
  }

  public async getUnspentAddress(address: string): Promise<IUnspentResponse | any> {
    const { scripthash } = detectAddressTypeToScripthash(address);
    return this.getUnspentScripthash(scripthash);
  }

  public async getUnspentScripthash(scripthash: string): Promise<IUnspentResponse | any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.scripthash.listunspent', [scripthash])
        .then(function (result: any) {
          const data = {
            unconfirmed: 0,
            confirmed: 0,
            //balance: 0,
            utxos: [] as UTXO[]
          };

          for (const utxo of result) {
            if (!utxo.height || utxo.height <= 0) {
              data.unconfirmed += utxo.value;
            } else {
              data.confirmed += utxo.value;
            }
            //data.balance += utxo.value;
            data.utxos.push({
              txid: utxo.tx_hash,
              txId: utxo.tx_hash,
              // height: utxo.height,
              outputIndex: utxo.tx_pos,
              index: utxo.tx_pos,
              vout: utxo.tx_pos,
              value: utxo.value
              //atomicals: utxo.atomicals,
              //script: addressToP2PKH(address)
            });
          }
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
    return p;
  }

  async waitUntilUTXO(
    address: string,
    satoshis: number,
    intervalSeconds = 10,
    exactSatoshiAmount = false
  ): Promise<any> {
    function hasAttachedAtomicals(utxo: UTXO): any | null {
      if (utxo && utxo.atomicals && utxo.atomicals.length) {
        return true;
      }
      return false;
    }

    return new Promise<any[]>((resolve, reject) => {
      let intervalId: any;
      const checkForUtxo = async () => {
        console.log('...');
        try {
          const response: any = await this.getUnspentAddress(address);
          const utxos = response.utxos;

          for (const utxo of utxos) {
            // Do not use utxos that have attached atomicals
            if (hasAttachedAtomicals(utxo)) {
              continue;
            }
            // If the exact amount was requested, then only return if the exact amount is found
            if (exactSatoshiAmount) {
              if (utxo.value === satoshis) {
                clearInterval(intervalId);
                resolve(utxo);
                return;
              }
            } else {
              if (utxo.value >= satoshis) {
                clearInterval(intervalId);
                resolve(utxo);
                return;
              }
            }
          }
        } catch (error: any) {
          console.log('error', error);
          reject(error);
          clearInterval(intervalId);
        }
      };
      intervalId = setInterval(checkForUtxo, intervalSeconds * 1000);
    });
  }

  public async serverVersion(): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('server.version', [])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
    return p;
  }

  public async broadcast(rawtx: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.transaction.broadcast', [rawtx])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetGlobal(): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_global', [true])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGet(atomicalAliasOrId: string | number): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get', [atomicalAliasOrId])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetLocation(atomicalAliasOrId: string | number): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_location', [atomicalAliasOrId])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetStateHistory(atomicalAliasOrId: string | number): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_state_history', [atomicalAliasOrId])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetState(atomicalAliasOrId: string | number, path: string, verbose: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_state_by_path', [atomicalAliasOrId, path, verbose ? 1 : 0])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetEventHistory(atomicalAliasOrId: string | number): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_events', [atomicalAliasOrId])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetTxHistory(atomicalAliasOrId: string | number): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_tx_history', [atomicalAliasOrId])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async history(scripthash: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.scripthash.get_history', [scripthash])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsList(limit: number, offset: number, asc = false): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.list', [limit, offset, asc ? 1 : 0])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsByScripthash(scripthash: string, verbose = true): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const params: any[] = [scripthash];
      if (verbose) {
        params.push(true);
      }
      this._send('blockchain.atomicals.listscripthash', params)
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsByAddress(address: string): Promise<any> {
    const { scripthash } = detectAddressTypeToScripthash(address);
    return this.atomicalsByScripthash(scripthash);
  }

  public async atomicalsAtLocation(location: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.at_location', [location])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async txs(txs: string[], verbose: boolean): Promise<any> {
    let p;
    if (true) {
      p = [];
      for (const tx of txs) {
        p.push(
          new Promise((resolve, reject) => {
            this.ws
              ?.call('blockchain.transaction.get', [tx, verbose ? 1 : 0])
              .then(function (result: any) {
                resolve(result);
              })
              .catch((error) => {
                console.log('error ', error);
                reject(error);
              });
          })
        );
      }
      return Promise.all(p);
    }
  }

  public async atomicalsGetRealmInfo(realmOrSubRealm: string, verbose?: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_realm_info', [realmOrSubRealm, verbose ? 1 : 0])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetByRealm(realm: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_by_realm', [realm])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetByTicker(ticker: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_by_ticker', [ticker])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsGetByContainer(container: string): Promise<any> {
    const p = new Promise((resolve, reject) => {
      this._send('blockchain.atomicals.get_by_container', [container])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsFindTickers(prefix: string | null, asc?: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const args: any = [];
      args.push(prefix ? prefix : null);
      if (!asc) {
        args.push(1);
      } else {
        args.push(0);
      }
      this._send('blockchain.atomicals.find_tickers', args)
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsFindContainers(prefix: string | null, asc?: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const args: any = [];
      args.push(prefix ? prefix : null);
      if (!asc) {
        args.push(1);
      } else {
        args.push(0);
      }
      this._send('blockchain.atomicals.find_containers', args)
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsFindRealms(prefix: string | null, asc?: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const args: any = [];
      args.push(prefix ? prefix : null);
      if (!asc) {
        args.push(1);
      } else {
        args.push(0);
      }
      this._send('blockchain.atomicals.find_realms', args)
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }

  public async atomicalsFindSubRealms(parentRealmId: string, prefix: string | null, asc?: boolean): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const args: any = [];
      args.push(prefix ? prefix : null);
      if (!asc) {
        args.push(1);
      } else {
        args.push(0);
      }
      this._send('blockchain.atomicals.find_subrealms', [parentRealmId, args])
        .then(function (result: any) {
          resolve(result);
        })
        .catch((error) => {
          console.log('error ', error);
          reject(error);
        });
    });
    return p;
  }
}
