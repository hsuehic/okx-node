interface OkxTraderConfig {
  name: string;
  type: TraderType;
  instId: InstId;
}

interface OkxDiffTraderConfig extends OkxTraderConfig {
  type: 'diff';
  maximunOrders: number;
}

interface OkxPriceTraderConfig extends OkxTraderConfig {
  type: 'price';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  name: string;
}

type OkxTraderConfigType = OkxDiffTraderConfig | OkxPriceTraderConfig;
