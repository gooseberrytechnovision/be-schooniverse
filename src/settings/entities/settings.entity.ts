import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true, name: 'enable_individual_products' })
  enableIndividualProducts: boolean;

  @Column({ default: true, name: 'enable_bulk_products' })
  enableBulkProducts: boolean;

  @Column({ default: true, name: 'enable_purchasing' })
  enablePurchasing: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 