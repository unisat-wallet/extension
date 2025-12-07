// ========================================
// Client configuration
// ========================================

import { NetworkType } from '@unisat/wallet-types';

export interface ClientConfig {
  endpoint?: string;
  network?: NetworkType;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  apiKey?: string;
  userAgent?: string;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
// ========================================
// API response format
// ========================================

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}
