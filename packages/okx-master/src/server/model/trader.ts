import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tbTrader')
export class Trader {
  @PrimaryColumn({
    nullable: false,
  })
  id!: string;

  @Column({
    nullable: false,
  })
  name!: string;

  @Column({
    nullable: true,
    default: true,
  })
  status!: TraderStatus;

  @Column({
    nullable: true,
  })
  instId!: string;

  @Column({
    nullable: false,
  })
  type: TraderType;

  /**
   * Trader config json string, can be deserialize to an object used to constructor a trader
   */
  @Column({
    nullable: false,
    default: '{}',
  })
  config!: string;

  @Column({
    nullable: true,
    default: 0,
  })
  boughtSize = 0;

  @Column({
    nullable: true,
    default: 0,
  })
  boughtPrice = 0;

  @Column({
    nullable: true,
    default: 0,
  })
  soldSize = 0;

  @Column({
    nullable: true,
    default: 0,
  })
  soldPrice = 0;

  @Column({
    nullable: true,
    default: 0,
  })
  tradedPrice = 0;

  @Column({
    nullable: true,
    default: 0,
  })
  tradedSize = 0;

  /**
   * timestamp of the time when the trader created
   */
  @Column({
    nullable: false,
  })
  ts!: number;
}
