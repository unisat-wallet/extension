import { HD_PATH_PATTERN, MAX_ACCOUNT_COUNT, MIN_ACCOUNT_COUNT, XPUB_PREFIXES } from './constants';

// Helper functions
export const validateXpubPrefix = (xpub: string): boolean => {
  return XPUB_PREFIXES.some((prefix) => xpub.startsWith(prefix));
};

export const validateHdPath = (hdPath: string): boolean => {
  return HD_PATH_PATTERN.test(hdPath);
};

export const validateAccountCount = (count: number): boolean => {
  return count >= MIN_ACCOUNT_COUNT && count <= MAX_ACCOUNT_COUNT;
};

export const formatAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const formatBalance = (balance: number): string => {
  if (balance === 0) return '0';
  if (balance < 0.00000001) return '< 0.00000001';
  return balance.toFixed(8).replace(/\.?0+$/, '');
};
