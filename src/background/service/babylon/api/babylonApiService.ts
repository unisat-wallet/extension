export class BabylonApiService {
  endpointV1 = '';
  endpointV2 = '';

  constructor(endpointV1: string, endpointV2: string) {
    this.endpointV1 = endpointV1;
    this.endpointV2 = endpointV2;
  }

  httpGet = async (route: string, params: any) => {
    let url = route;
    let c = 0;
    for (const id in params) {
      if (c == 0) {
        url += '?';
      } else {
        url += '&';
      }
      url += `${id}=${params[id]}`;
      c++;
    }
    const headers = new Headers();
    let res: Response;
    try {
      res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    } catch (e: any) {
      throw new Error('Network error: ' + e && e.message);
    }

    let jsonRes: { code: number; msg: string; data: any };

    if (!res) throw new Error('Network error, no response');
    if (res.status !== 200) throw new Error('Network error with status: ' + res.status);
    try {
      jsonRes = await res.json();
    } catch (e) {
      throw new Error('Network error, json parse error');
    }
    if (!jsonRes) throw new Error('Network error,no response data');

    return jsonRes.data;
  };

  async getBabylonStakingStatusV1() {
    return this.httpGet(this.endpointV1 + `/v1/stats`, {});
  }

  async getBabylonStakingStatusV2() {
    return this.httpGet(this.endpointV2 + `/v2/stats`, {});
  }
}
