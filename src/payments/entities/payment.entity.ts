import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn,
  UpdateDateColumn, JoinColumn
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod { 
  DIRECT = 'DIRECT', 
  AUTO_DEBIT = 'AUTO_DEBIT' 
}

export enum PaymentStatus {
  PAID = 'PAID', 
  FAILED = 'FAILED' 
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event' })
  event: string;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' , nullable: true, default: PaymentMethod.DIRECT })
  method: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.FAILED, name: 'payment_status' })
  status: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true, name: 'external_reference' })
  externalReference: string;

  @Column('jsonb', { default: {}, name: 'raw' })
  raw: any;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true, name: 'application_code' })
  applicationCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 