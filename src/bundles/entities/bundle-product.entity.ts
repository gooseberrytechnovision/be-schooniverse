import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNumber, IsBoolean, Min } from 'class-validator';
import { Bundle } from './bundle.entity';
import { Product } from './product.entity';

@Entity('bundle_products')
export class BundleProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  @IsNumber()
  @Min(1)
  quantity: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  optional: boolean;

  @ManyToOne(() => Bundle, (bundle) => bundle.bundleProducts, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: Bundle;

  @Column({ name: 'bundle_id' })
  bundleId: number;

  @ManyToOne(() => Product, (product) => product.bundleProducts, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 