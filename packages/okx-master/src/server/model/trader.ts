import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tbTrader')
export class Trader {
  @PrimaryColumn({
    length: 16,
  })
  id!: string;

  @Column({
    nullable: true,
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

  /**
   * timestamp of the time when the trader created
   */
  @Column({
    nullable: false,
  })
  ts!: number;
}
