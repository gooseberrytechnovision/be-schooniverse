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

export enum SettlementStatus {
  SETTLED = 'SETTLED',
  PENDING = 'PENDING',
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

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING
  })
  settlement_status: SettlementStatus;

  @Column({ name: 'tracking_id' })
  trackingId: string;

  @Column({ name: 'is_address_edited', default: false })
  isAddressEdited: boolean;

  @Column({ name: 'delivery_address', nullable: true })
  deliveryAddress: string;

  @Column({ name: 'shipping_method', nullable: true })
  shippingMethod: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
} 