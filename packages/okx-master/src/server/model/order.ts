import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tbOrder')
export class Order {
  /**
   * accumulative filled size
   */
  @Column({
    nullable: true,
  })
  accFillSz: string;

  @Column({
    nullable: true,
  })
  amendResult: string;

  /**
   * average fill price
   */
  @Column({
    length: 10,
    nullable: true,
  })
  avgPx: string;

  @Column({
    nullable: true,
  })
  cTime: string;

  @Column({
    nullable: true,
  })
  category: string;

  @Column({
    nullable: true,
  })
  ccy: string;

  @Column({
    nullable: true,
  })
  clOrdId: string;

  /**
   * error code, default '0' withou error
   */
  @Column({
    nullable: true,
  })
  code: string;

  @Column({
    nullable: true,
  })
  execType: string;

  /**
   * accumulative fee
   */
  @Column({
    nullable: true,
  })
  fee: string;

  @Column({
    nullable: true,
  })
  feeCcy: string;

  @Column({
    nullable: true,
  })
  fillFee: string;

  @Column({
    nullable: true,
  })
  fillFeeCcy: string;

  @Column({
    nullable: true,
  })
  fillNotionalUsd: string;

  /**
   * latest fill price
   */
  @Column({
    nullable: true,
  })
  fillPx: string;

  /**
   * latest fill size
   */
  @Column({
    nullable: true,
  })
  fillSz: string;

  @Column({
    nullable: true,
  })
  fillPnl: string;
  /**
   * latest fill time
   */
  @Column({
    nullable: true,
  })
  fillTime: string;

  @Column({
    nullable: false,
  })
  instId: string;

  @Column({
    nullable: true,
  })
  instType: string;

  @Column({
    nullable: true,
  })
  lever: string;

  @Column({
    nullable: true,
  })
  msg: string;

  @Column({
    nullable: true,
  })
  notionalUsd: string;

  @PrimaryColumn({
    nullable: false,
  })
  ordId: string;

  @Column({
    nullable: true,
  })
  ordType: string;

  @Column({
    nullable: true,
  })
  pnl: string;

  @Column({
    nullable: true,
  })
  posSide: string;

  /**
   * book price
   */
  @Column({
    nullable: true,
  })
  px: string;

  /**
   * accumulative rebate
   */
  @Column({
    nullable: true,
  })
  rebate: string;

  @Column({
    nullable: true,
  })
  rebateCcy: string;

  @Column({
    nullable: true,
  })
  reduceOnly: string;

  @Column({
    nullable: true,
  })
  reqId: string;

  @Column({
    nullable: true,
  })
  side: string;

  @Column({
    nullable: true,
  })
  attachAlgoClOrdId: string;

  @Column({
    nullable: true,
  })
  slOrdPx: string;

  @Column({
    nullable: true,
  })
  slTriggerPx: string;

  @Column({
    nullable: true,
  })
  slTriggerPxType: string;

  @Column({
    nullable: true,
  })
  source: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
  })
  stpId: string;

  @Column({
    nullable: true,
  })
  stpMode: string;

  @Column({
    nullable: true,
  })
  sz: string;

  /**
   * tag of the order
   */
  @Column({
    nullable: true,
  })
  tag: string;

  @Column({
    nullable: true,
  })
  /**
   * trade mode
   */
  tdMode: string;

  /**
   * sz's `unit` for market price trade type
   */
  @Column({
    nullable: true,
  })
  tgtCcy: 'base_ccy' | 'quote_ccy';

  @Column({
    nullable: true,
  })
  tpOrdPx: string;

  @Column({
    nullable: true,
  })
  tpTriggerPx: string;

  @Column({
    nullable: true,
  })
  tpTriggerPxType: string;

  /**
   * latest trade id
   */
  @Column({
    nullable: true,
  })
  tradeId: string;

  /**
   * Margin Type
   */
  @Column({
    nullable: true,
  })
  quickMgnType: string;

  @Column({
    nullable: true,
  })
  algoClOrdId: string;

  @Column({
    nullable: true,
  })
  algoId: string;

  @Column({
    nullable: true,
  })
  amendSource: string;

  @Column({
    nullable: true,
  })
  cancelSource: string;

  /**
   * time when Order updated
   */
  @Column({
    nullable: true,
  })
  uTime: string;
}
