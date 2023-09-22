import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tbTrader')
export class Trader {
  @PrimaryColumn({
    length: 16,
  })
  name!: string;

  @Column()
  instId: string;

  @Column()
  basePx!: number;

  @Column()
  baseSz!: number;

  @Column()
  gap!: number;

  @Column()
  levelCount!: number;

  @Column()
  coefficient!: number;

  @Column({
    nullable: true,
    default: true,
  })
  status!: boolean;
}
