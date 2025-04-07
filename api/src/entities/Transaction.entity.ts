import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { TransactionType } from '../constants/transaction.enum';

@Entity('transaction')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'type', type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ name: 'category', length: 100 })
  category: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
