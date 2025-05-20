import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { BundleProduct } from './bundle-product.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Column('decimal', { precision: 10, scale: 2 ,name: 'unit_price'})
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unitPrice: number;

  @OneToMany(() => BundleProduct, (bundleProduct) => bundleProduct.product, {
    cascade: true
  })
  bundleProducts: BundleProduct[];

  @Column({ type: 'varchar', length: 255, name: 'size_chart'})
  sizeChart: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 