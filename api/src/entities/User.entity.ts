import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'uid' })
  uid: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'name' })
  name: string;
}
