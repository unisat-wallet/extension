// Validation constants
export const XPUB_PREFIXES = ['xpub', 'tpub', 'ypub', 'zpub'] as const;
export const HD_PATH_PATTERN = /^m(\/\d+'?)*$/;
export const MIN_ACCOUNT_COUNT = 1;
export const MAX_ACCOUNT_COUNT = 20;
export const DEFAULT_DISPLAY_COUNT = 20;
export const LOAD_MORE_BATCH_SIZE = 20;
export const DEFAULT_HD_PATH = 'm/84\'/0\'/0\'';
export const QR_SCANNER_SIZE = 360;

// Styles
export const cardStyle = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  padding: '0',
  borderRadius: '8px',
  overflow: 'hidden'
} as const;

export const footerStyle = {
  backgroundColor: '#060719',
  padding: '16px'
} as const;

export const bitcoinIconStyle = {
  width: '18px',
  height: '18px',
  backgroundColor: '#f4b62c',
  borderRadius: '50%'
} as const;
