type OrderSide = 'buy' | 'sell' | 'any';

interface OkxTraderConfig {
  name: string;
  type: TraderType;
  instId: InstId;
}

interface OkxPriceTraderConfig extends OkxTraderConfig {
  type: 'price';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  name: string;
  initialOrder?: OrderSide;
}

interface OkxTieredTraderConfig extends OkxTraderConfig {
  type: 'tiered';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  maxSize: number;
  minSize: number;
  name: string;
}

type OkxTraderConfigType = OkxPriceTraderConfig | OkxTieredTraderConfig;
