type CryptoCurrency =
  | 'BTC'
  | 'ETH'
  | 'LTC'
  | 'XRP'
  | 'SOL'
  | 'BCH'
  | 'DOGE'
  | 'FIL'
  | 'ADA'
  | 'ETC';
type Quote = 'USDC' | 'USDT';

type InstId = `${CryptoCurrency}-${Quote}`;
