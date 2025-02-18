import axios, { AxiosRequestConfig, HttpStatusCode } from 'axios';
import qs from 'qs';

import { ServerError } from './serverError';

type QueryParamValue = string | number | boolean | Array<string | number | boolean>;
type QueryParams = Record<string, QueryParamValue | undefined>;

interface RequestParams {
  query?: QueryParams;
  body?: any;
}

export const apiWrapper = async (
  baseUrl: string,
  method: 'GET' | 'POST',
  path: string,
  generalErrorMessage: string,
  params?: RequestParams,
  timeout?: number
) => {
  const axiosConfig: AxiosRequestConfig = {
    timeout: timeout || 0,
    params: params?.query,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  };

  const url = `${baseUrl}${path}`;

  try {
    if (method === 'GET') {
      return await axios.get(url, axiosConfig);
    } else {
      return await axios.post(url, params?.body, axiosConfig);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ServerError({
        message: error.response?.data?.message,
        status: error.response?.status,
        endpoint: path
      });
    }
    throw new ServerError({
      message: generalErrorMessage,
      status: HttpStatusCode.InternalServerError,
      endpoint: path
    });
  }
};
