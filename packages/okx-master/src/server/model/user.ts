import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity('tbUser')
export class User {
  @Generated('uuid')
  @Column()
  id: string;

  @PrimaryColumn()
  email: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  password: string;
}
