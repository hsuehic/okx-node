export const CCY_SUPORTED: CryptoCurrency[] = [
  'BTC',
  'BCH',
  'DOGE',
  'ETH',
  'LTC',
  'SOL',
  'XRP',
  'ADA',
  'ETC',
  'LINK',
  'FIL',
  'DOT',
  'TON',
  'ETC',
  'XMR',
  'WLD',
];
export const MARGIN_INST_ID_SUPPORTED: InstIdMargin[] = CCY_SUPORTED.map(
  v => `${v}-USDC`
).concat(CCY_SUPORTED.map(v => `${v}-USDT`)) as InstIdMargin[];
export const CLS_COLOR_DOWN = 'color-down';
export const CLS_COLOR_UP = 'color-up';

export const SWAP_INST_ID_SUPPORTED: InstIdSwap[] =
  MARGIN_INST_ID_SUPPORTED.map(v => `${v}-SWAP`) as InstIdSwap[];

export const INST_ID_SUPPORTED = [
  ...MARGIN_INST_ID_SUPPORTED,
  ...SWAP_INST_ID_SUPPORTED,
];
