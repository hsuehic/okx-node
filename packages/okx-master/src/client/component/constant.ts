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
];
export const INST_ID_SUPPORTED: InstId[] = CCY_SUPORTED.map(
  v => `${v}-USDC`
).concat(CCY_SUPORTED.map(v => `${v}-USDT`)) as InstId[];
export const CLS_COLOR_DOWN = 'color-down';
export const CLS_COLOR_UP = 'color-up';
