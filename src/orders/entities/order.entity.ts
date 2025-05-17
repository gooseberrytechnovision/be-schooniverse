import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum OrderStatus {
  IN_PROGRESS = 'IN_PROGRESS', 
  SHIPPED = 'SHIPPED', 
  DELIVERED = 'DELIVERED',
}

export enum TransactionStatus {
  PAID = 'PAID', 
  FAILED = 'FAILED'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id' })
  parentId: number;

  @ManyToOne(() => Parent)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.IN_PROGRESS
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.FAILED
  })
  transactionStatus: TransactionStatus;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
} 